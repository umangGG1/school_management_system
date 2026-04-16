import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ActivityService } from '../../../activity/activity.service';
import { QUEUE } from '../queue.constants';

export interface ArchivalJobData {
  schoolId: string;
  olderThanDays?: number;
}

/**
 * Runs daily (triggered by a cron job or manual POST /admin/maintenance/archive).
 * Deletes activity_log rows older than N days to keep the table lean.
 */
@Processor(QUEUE.ARCHIVAL)
export class ArchivalProcessor extends WorkerHost {
  private readonly logger = new Logger(ArchivalProcessor.name);

  constructor(private readonly activityService: ActivityService) {
    super();
  }

  async process(job: Job<ArchivalJobData>): Promise<{ deleted: number }> {
    const { schoolId, olderThanDays = 90 } = job.data;
    this.logger.log(`Archiving activity logs older than ${olderThanDays} days for school ${schoolId}`);

    const deleted = await this.activityService.purgeOld(schoolId, olderThanDays);
    this.logger.log(`Archived ${deleted} activity log entries for school ${schoolId}`);

    return { deleted };
  }
}
