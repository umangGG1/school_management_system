import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval, ApprovalStatus } from './entities/approval.entity';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepo: Repository<Approval>,
  ) {}

  async findPending(schoolId: string): Promise<Approval[]> {
    return this.approvalRepo.find({
      where: { schoolId, status: ApprovalStatus.PENDING },
      relations: ['requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(schoolId: string, status?: ApprovalStatus): Promise<Approval[]> {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.approvalRepo.find({
      where,
      relations: ['requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async approve(id: string, schoolId: string, reviewedById: string, notes?: string): Promise<Approval> {
    const approval = await this.approvalRepo.findOne({ where: { id, schoolId } });
    if (!approval) throw new NotFoundException('Approval not found');
    approval.status = ApprovalStatus.APPROVED;
    approval.reviewedById = reviewedById;
    approval.reviewNotes = notes ?? null;
    return this.approvalRepo.save(approval);
  }

  async reject(id: string, schoolId: string, reviewedById: string, notes?: string): Promise<Approval> {
    const approval = await this.approvalRepo.findOne({ where: { id, schoolId } });
    if (!approval) throw new NotFoundException('Approval not found');
    approval.status = ApprovalStatus.REJECTED;
    approval.reviewedById = reviewedById;
    approval.reviewNotes = notes ?? null;
    return this.approvalRepo.save(approval);
  }

  async create(data: Partial<Approval>): Promise<Approval> {
    return this.approvalRepo.save(this.approvalRepo.create(data));
  }

  async countPending(schoolId: string): Promise<number> {
    return this.approvalRepo.count({ where: { schoolId, status: ApprovalStatus.PENDING } });
  }
}
