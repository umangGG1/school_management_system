import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
  ) {}

  async create(
    schoolId: string,
    createdById: string,
    dto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const entity = this.repo.create({
      ...dto,
      schoolId,
      createdById,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
    });
    return this.repo.save(entity);
  }

  async findAll(
    schoolId: string,
    query?: { category?: string; audience?: string; page?: number; limit?: number },
  ) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.createdBy', 'user')
      .where('a.schoolId = :schoolId AND a.isDeleted = false', { schoolId })
      .orderBy('a.isPinned', 'DESC')
      .addOrderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query?.category) qb.andWhere('a.category = :category', { category: query.category });
    if (query?.audience) qb.andWhere('a.targetAudience = :audience', { audience: query.audience });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findPinned(schoolId: string): Promise<Announcement[]> {
    return this.repo.find({
      where: { schoolId, isPinned: true, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async findOne(id: string, schoolId: string): Promise<Announcement> {
    const item = await this.repo.findOne({ where: { id, schoolId, isDeleted: false } });
    if (!item) throw new NotFoundException(`Announcement ${id} not found`);
    return item;
  }

  async update(id: string, schoolId: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const item = await this.findOne(id, schoolId);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const item = await this.findOne(id, schoolId);
    item.isDeleted = true;
    await this.repo.save(item);
  }

  async getRecentForDashboard(schoolId: string, limit = 3): Promise<Announcement[]> {
    return this.repo.find({
      where: { schoolId, isDeleted: false },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }
}
