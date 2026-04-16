import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetCategory } from './entities/asset.entity';
import { FacilityBooking, BookingStatus } from './entities/facility-booking.entity';
import { MaintenanceRequest, MaintenanceStatus } from './entities/maintenance-request.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Asset)               private readonly assetRepo: Repository<Asset>,
    @InjectRepository(FacilityBooking)     private readonly bookingRepo: Repository<FacilityBooking>,
    @InjectRepository(MaintenanceRequest)  private readonly maintenanceRepo: Repository<MaintenanceRequest>,
  ) {}

  // ── Assets ────────────────────────────────────────────────────────────────

  async findAssets(
    schoolId: string,
    opts: { category?: AssetCategory; location?: string; page?: number; limit?: number },
  ): Promise<{ data: Asset[]; total: number }> {
    const qb = this.assetRepo.createQueryBuilder('a')
      .where('a.schoolId = :schoolId AND a.isActive = true', { schoolId });
    if (opts.category)  qb.andWhere('a.category = :cat', { cat: opts.category });
    if (opts.location)  qb.andWhere('a.location ILIKE :loc', { loc: `%${opts.location}%` });
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    qb.orderBy('a.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async createAsset(schoolId: string, data: Partial<Asset>): Promise<Asset> {
    return this.assetRepo.save(this.assetRepo.create({ ...data, schoolId }));
  }

  async updateAsset(id: string, schoolId: string, data: Partial<Asset>): Promise<Asset> {
    const asset = await this.assetRepo.findOne({ where: { id, schoolId } });
    if (!asset) throw new NotFoundException('Asset not found');
    return this.assetRepo.save({ ...asset, ...data });
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  async findBookings(
    schoolId: string,
    opts: { date?: string; status?: BookingStatus },
  ): Promise<FacilityBooking[]> {
    const qb = this.bookingRepo.createQueryBuilder('b').where('b.schoolId = :schoolId', { schoolId });
    if (opts.date)    qb.andWhere('b.bookingDate = :date', { date: opts.date });
    if (opts.status)  qb.andWhere('b.status = :status', { status: opts.status });
    return qb.orderBy('b.bookingDate', 'DESC').addOrderBy('b.startTime', 'ASC').getMany();
  }

  async createBooking(schoolId: string, data: Partial<FacilityBooking>): Promise<FacilityBooking> {
    return this.bookingRepo.save(this.bookingRepo.create({ ...data, schoolId }));
  }

  async updateBooking(
    id: string,
    schoolId: string,
    data: { status?: BookingStatus; approvedBy?: string },
  ): Promise<FacilityBooking> {
    const booking = await this.bookingRepo.findOne({ where: { id, schoolId } });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.bookingRepo.save({ ...booking, ...data });
  }

  // ── Maintenance Requests ──────────────────────────────────────────────────

  async findMaintenance(
    schoolId: string,
    status?: MaintenanceStatus,
  ): Promise<MaintenanceRequest[]> {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.maintenanceRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async createMaintenance(schoolId: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    return this.maintenanceRepo.save(this.maintenanceRepo.create({ ...data, schoolId }));
  }

  async updateMaintenance(
    id: string,
    schoolId: string,
    data: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> {
    const req = await this.maintenanceRepo.findOne({ where: { id, schoolId } });
    if (!req) throw new NotFoundException('Maintenance request not found');
    if (data.status === MaintenanceStatus.RESOLVED && !req.resolvedAt) {
      (data as any).resolvedAt = new Date();
    }
    return this.maintenanceRepo.save({ ...req, ...data });
  }
}
