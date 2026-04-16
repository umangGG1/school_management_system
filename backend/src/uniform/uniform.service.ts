import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UniformItem } from './entities/uniform-item.entity';
import { UniformStock, UniformSize } from './entities/uniform-stock.entity';
import { UniformAllocation } from './entities/uniform-allocation.entity';

@Injectable()
export class UniformService {
  constructor(
    @InjectRepository(UniformItem)       private readonly itemRepo: Repository<UniformItem>,
    @InjectRepository(UniformStock)      private readonly stockRepo: Repository<UniformStock>,
    @InjectRepository(UniformAllocation) private readonly allocationRepo: Repository<UniformAllocation>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Stock ─────────────────────────────────────────────────────────────────

  async findStock(schoolId: string): Promise<(UniformStock & { isLow: boolean })[]> {
    const rows = await this.stockRepo.find({
      where: { schoolId },
      order: { uniformItemId: 'ASC', size: 'ASC' },
    });
    return rows.map(r => ({ ...r, isLow: r.quantityInStock <= r.reorderLevel }));
  }

  async findLowStock(schoolId: string): Promise<UniformStock[]> {
    return this.dataSource.query(
      `SELECT * FROM uniform_stock WHERE school_id = $1 AND quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC`,
      [schoolId],
    );
  }

  async adjustStock(
    schoolId: string,
    uniformStockId: string,
    delta: number,
    reason: string,
  ): Promise<UniformStock> {
    const stock = await this.stockRepo.findOne({ where: { id: uniformStockId, schoolId } });
    if (!stock) throw new NotFoundException('Stock record not found');
    stock.quantityInStock = Math.max(0, stock.quantityInStock + delta);
    stock.lastUpdated = new Date();
    return this.stockRepo.save(stock);
  }

  // ── Allocations ───────────────────────────────────────────────────────────

  async findAllocations(
    schoolId: string,
    opts: { page?: number; limit?: number },
  ): Promise<{ data: UniformAllocation[]; total: number }> {
    const [data, total] = await this.allocationRepo.findAndCount({
      where: { schoolId },
      order: { createdAt: 'DESC' },
      skip: ((opts.page ?? 1) - 1) * (opts.limit ?? 20),
      take: opts.limit ?? 20,
    });
    return { data, total };
  }

  async findStudentAllocations(studentId: string, schoolId: string): Promise<UniformAllocation[]> {
    return this.allocationRepo.find({
      where: { studentId, schoolId },
      order: { issuedAt: 'DESC' },
    });
  }

  async issueUniform(
    schoolId: string,
    data: {
      studentId: string;
      uniformItemId: string;
      uniformStockId: string;
      size: UniformSize;
      quantity: number;
      issuedBy: string;
    },
  ): Promise<UniformAllocation> {
    // Atomic decrement — fails if stock insufficient
    const result = await this.dataSource.query(
      `UPDATE uniform_stock
         SET quantity_in_stock = quantity_in_stock - $1, last_updated = NOW()
       WHERE id = $2 AND school_id = $3 AND quantity_in_stock >= $1`,
      [data.quantity, data.uniformStockId, schoolId],
    );
    if (result[1] === 0) {
      throw new ConflictException('Insufficient stock to issue this uniform');
    }

    return this.allocationRepo.save(
      this.allocationRepo.create({ ...data, schoolId, issuedAt: new Date() }),
    );
  }

  async returnUniform(
    id: string,
    schoolId: string,
    condition: string,
  ): Promise<UniformAllocation> {
    const allocation = await this.allocationRepo.findOne({ where: { id, schoolId } });
    if (!allocation) throw new NotFoundException('Allocation not found');
    if (allocation.returnedAt) throw new ConflictException('Already returned');

    // Return stock
    await this.stockRepo.increment(
      { id: allocation.uniformStockId, schoolId },
      'quantityInStock',
      allocation.quantity,
    );

    return this.allocationRepo.save({
      ...allocation,
      returnedAt: new Date(),
      condition: condition as any,
    });
  }
}
