import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './entities/activity-log.entity';

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

  async log(
    schoolId: string,
    type: ActivityType,
    description: string,
    opts?: { entityType?: string; entityId?: string; performedById?: string },
  ): Promise<ActivityLog> {
    return this.logRepo.save(
      this.logRepo.create({
        schoolId,
        type,
        description,
        entityType: opts?.entityType,
        entityId: opts?.entityId,
        performedById: opts?.performedById,
      }),
    );
  }
}
