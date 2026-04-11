import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ActivityLog, ActivityType, ActivitySeverity } from './entities/activity-log.entity';

export interface LogActivityOpts {
  entityType?: string;
  entityId?: string;
  performedById?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  severity?: ActivitySeverity;
}

export interface ListActivityQuery {
  limit?: number;
  skip?: number;
  severity?: ActivitySeverity;
  type?: ActivityType;
  search?: string;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
  ) {}

  async getRecent(schoolId: string, limit = 10): Promise<ActivityLog[]> {
    return this.logRepo.find({
      where: { schoolId },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAll(
    schoolId: string,
    query: ListActivityQuery,
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const { limit = 50, skip = 0, severity, type, search } = query;

    const qb = this.logRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.performedBy', 'user')
      .where('log.schoolId = :schoolId', { schoolId })
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (severity) qb.andWhere('log.severity = :severity', { severity });
    if (type)     qb.andWhere('log.type = :type', { type });
    if (search) {
      qb.andWhere(
        '(log.description ILIKE :q OR log.userName ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async purgeOld(schoolId: string, olderThanDays = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const result = await this.logRepo.delete({
      schoolId,
      createdAt: LessThan(cutoff),
    });
    return result.affected ?? 0;
  }

  async log(
    schoolId: string,
    type: ActivityType,
    description: string,
    opts: LogActivityOpts = {},
  ): Promise<ActivityLog> {
    return this.logRepo.save(
      this.logRepo.create({
        schoolId,
        type,
        description,
        entityType:    opts.entityType,
        entityId:      opts.entityId,
        performedById: opts.performedById,
        userName:      opts.userName,
        userRole:      opts.userRole,
        ipAddress:     opts.ipAddress,
        severity:      opts.severity ?? 'info',
      }),
    );
  }
}
