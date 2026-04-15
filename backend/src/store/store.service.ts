import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StoreItem, StoreCategory } from './entities/store-item.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { Requisition, RequisitionStatus } from './entities/requisition.entity';
import { RequisitionItem } from './entities/requisition-item.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreItem)       private readonly itemRepo: Repository<StoreItem>,
    @InjectRepository(StockMovement)   private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(Requisition)     private readonly requisitionRepo: Repository<Requisition>,
    @InjectRepository(RequisitionItem) private readonly reqItemRepo: Repository<RequisitionItem>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Items ─────────────────────────────────────────────────────────────────

  async findItems(
    schoolId: string,
    opts: { category?: StoreCategory; page?: number; limit?: number },
  ): Promise<{ data: StoreItem[]; total: number }> {
    const qb = this.itemRepo.createQueryBuilder('i')
      .where('i.schoolId = :schoolId AND i.isActive = true', { schoolId });
    if (opts.category) qb.andWhere('i.category = :cat', { cat: opts.category });
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    qb.orderBy('i.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findLowStock(schoolId: string): Promise<StoreItem[]> {
    return this.dataSource.query(
      `SELECT * FROM store_items WHERE school_id = $1 AND is_active = true AND quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC`,
      [schoolId],
    );
  }

  async createItem(schoolId: string, data: Partial<StoreItem>): Promise<StoreItem> {
    return this.itemRepo.save(this.itemRepo.create({ ...data, schoolId }));
  }

  async updateItem(id: string, schoolId: string, data: Partial<StoreItem>): Promise<StoreItem> {
    const item = await this.itemRepo.findOne({ where: { id, schoolId } });
    if (!item) throw new NotFoundException('Store item not found');
    return this.itemRepo.save({ ...item, ...data });
  }

  // ── Stock Movements ───────────────────────────────────────────────────────

  async findMovements(
    schoolId: string,
    opts: { storeItemId?: string; page?: number; limit?: number },
  ): Promise<{ data: StockMovement[]; total: number }> {
    const qb = this.movementRepo.createQueryBuilder('m')
      .where('m.schoolId = :schoolId', { schoolId });
    if (opts.storeItemId) qb.andWhere('m.storeItemId = :itemId', { itemId: opts.storeItemId });
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async manualAdjustment(
    schoolId: string,
    storeItemId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    performedBy: string,
  ): Promise<StockMovement> {
    const item = await this.itemRepo.findOne({ where: { id: storeItemId, schoolId } });
    if (!item) throw new NotFoundException('Store item not found');

    const delta = type === MovementType.OUT ? -quantity : quantity;
    const newQty = item.quantityInStock + delta;
    if (newQty < 0) throw new ConflictException('Insufficient stock');

    await this.itemRepo.update({ id: storeItemId }, { quantityInStock: newQty });

    return this.movementRepo.save(
      this.movementRepo.create({ storeItemId, schoolId, type, quantity, reason, performedBy }),
    );
  }

  // ── Requisitions ──────────────────────────────────────────────────────────

  async findRequisitions(
    schoolId: string,
    opts: { status?: RequisitionStatus; page?: number; limit?: number },
  ): Promise<{ data: Requisition[]; total: number }> {
    const qb = this.requisitionRepo.createQueryBuilder('r').where('r.schoolId = :schoolId', { schoolId });
    if (opts.status) qb.andWhere('r.status = :status', { status: opts.status });
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async createRequisition(
    schoolId: string,
    data: { requestedBy: string; department?: string; notes?: string; items: { storeItemId: string; quantityRequested: number; notes?: string }[] },
  ): Promise<Requisition> {
    return this.dataSource.transaction(async (manager) => {
      const req = await manager.save(Requisition,
        manager.create(Requisition, { schoolId, requestedBy: data.requestedBy, department: data.department, notes: data.notes }),
      );
      for (const item of data.items) {
        await manager.save(RequisitionItem,
          manager.create(RequisitionItem, { requisitionId: req.id, ...item }),
        );
      }
      return req;
    });
  }

  async approveRequisition(id: string, schoolId: string, reviewedBy: string): Promise<Requisition> {
    return this.dataSource.transaction(async (manager) => {
      const req = await manager.findOne(Requisition, { where: { id, schoolId } });
      if (!req) throw new NotFoundException('Requisition not found');
      if (req.status !== RequisitionStatus.PENDING) {
        throw new ConflictException('Only PENDING requisitions can be approved');
      }

      const reqItems = await manager.find(RequisitionItem, { where: { requisitionId: id } });
      let allFulfilled = true;

      for (const ri of reqItems) {
        // Atomic decrement per item
        const result = await manager.query(
          `UPDATE store_items SET quantity_in_stock = quantity_in_stock - $1
           WHERE id = $2 AND school_id = $3 AND quantity_in_stock >= $1`,
          [ri.quantityRequested, ri.storeItemId, schoolId],
        );
        const issued = result[1] > 0 ? ri.quantityRequested : 0;
        await manager.update(RequisitionItem, ri.id, { quantityIssued: issued });
        if (issued < ri.quantityRequested) allFulfilled = false;

        // Record movement
        await manager.save(StockMovement, manager.create(StockMovement, {
          storeItemId: ri.storeItemId,
          schoolId,
          type: MovementType.OUT,
          quantity: issued,
          reason: `Requisition ${req.id}`,
          performedBy: reviewedBy,
          requisitionId: id,
        }));
      }

      req.status = allFulfilled ? RequisitionStatus.FULFILLED : RequisitionStatus.PARTIALLY_FULFILLED;
      req.reviewedBy = reviewedBy;
      req.reviewedAt = new Date();
      return manager.save(Requisition, req);
    });
  }

  async rejectRequisition(id: string, schoolId: string, reviewedBy: string): Promise<Requisition> {
    const req = await this.requisitionRepo.findOne({ where: { id, schoolId } });
    if (!req) throw new NotFoundException('Requisition not found');
    if (req.status !== RequisitionStatus.PENDING) throw new ConflictException('Cannot reject non-pending requisition');
    return this.requisitionRepo.save({
      ...req,
      status: RequisitionStatus.REJECTED,
      reviewedBy,
      reviewedAt: new Date(),
    });
  }
}
