import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EcaActivity }         from './entities/eca-activity.entity';
import { EcaCompetition }      from './entities/eca-competition.entity';
import { EcaAttendanceRecord } from './entities/eca-attendance.entity';

// ── Return-type shapes ────────────────────────────────────────────────────────

export interface EcaSummary {
  totalActivities: number;
  totalEnrolled: number;
  avgAttendance: number;
  competitions: number;
}

export interface AttendanceRateRow {
  activityId: string;
  activityName: string;
  rate: number;
  trend: string;
}

export interface PatronRow {
  staffName: string;
  activities: string[];
  reportCount: number;
}

export interface AttendanceEntry {
  studentId: string;
  status: string;
}

export interface RecordAttendanceData {
  activityId: string;
  sessionDate: string;
  entries: AttendanceEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class EcaService {
  constructor(
    @InjectRepository(EcaActivity)         private readonly activityRepo: Repository<EcaActivity>,
    @InjectRepository(EcaCompetition)      private readonly competitionRepo: Repository<EcaCompetition>,
    @InjectRepository(EcaAttendanceRecord) private readonly attendanceRepo: Repository<EcaAttendanceRecord>,
  ) {}

  // ── Summary ────────────────────────────────────────────────────────────────

  async getSummary(schoolId: string): Promise<EcaSummary> {
    // Active activities count + total enrolled (sum of memberCount)
    const activities = await this.activityRepo.find({
      where: { schoolId, isActive: true },
    });

    const totalActivities = activities.length;
    const totalEnrolled   = activities.reduce((sum, a) => sum + (a.memberCount ?? 0), 0);

    // Competitions this calendar year
    const currentYear = new Date().getFullYear();
    const yearStart   = `${currentYear}-01-01`;
    const yearEnd     = `${currentYear}-12-31`;

    const competitions = await this.competitionRepo
      .createQueryBuilder('c')
      .where('c.schoolId = :schoolId', { schoolId })
      .andWhere('c.eventDate >= :yearStart', { yearStart })
      .andWhere('c.eventDate <= :yearEnd', { yearEnd })
      .getCount();

    // Average attendance rate across all active activities
    let avgAttendance = 80; // default when no records exist

    if (totalActivities > 0) {
      const activityIds = activities.map(a => a.id);

      const records = await this.attendanceRepo
        .createQueryBuilder('att')
        .select('att.activityId', 'activityId')
        .addSelect('SUM(CASE WHEN att.status IN (\'PRESENT\', \'LATE\') THEN 1 ELSE 0 END)', 'present')
        .addSelect('COUNT(*)', 'total')
        .where('att.schoolId = :schoolId', { schoolId })
        .andWhere('att.activityId IN (:...activityIds)', { activityIds })
        .groupBy('att.activityId')
        .getRawMany<{ activityId: string; present: string; total: string }>();

      if (records.length > 0) {
        const rateSum = records.reduce((sum, row) => {
          const total   = Number(row.total);
          const present = Number(row.present);
          return sum + (total > 0 ? (present / total) * 100 : 0);
        }, 0);
        avgAttendance = Math.round(rateSum / records.length);
      }
    }

    return { totalActivities, totalEnrolled, avgAttendance, competitions };
  }

  // ── Activities ─────────────────────────────────────────────────────────────

  async getActivities(schoolId: string): Promise<EcaActivity[]> {
    return this.activityRepo.find({
      where: { schoolId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createActivity(schoolId: string, data: Partial<EcaActivity> | Record<string, unknown>): Promise<EcaActivity> {
    return this.activityRepo.save(
      this.activityRepo.create({ ...data, schoolId }),
    );
  }

  // ── Competitions ───────────────────────────────────────────────────────────

  async getCompetitions(schoolId: string): Promise<EcaCompetition[]> {
    return this.competitionRepo.find({
      where: { schoolId },
      order: { eventDate: 'DESC' },
    });
  }

  async createCompetition(schoolId: string, data: Partial<EcaCompetition> | Record<string, unknown>): Promise<EcaCompetition> {
    return this.competitionRepo.save(
      this.competitionRepo.create({ ...data, schoolId }),
    );
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  async getAttendanceRates(schoolId: string): Promise<AttendanceRateRow[]> {
    const activities = await this.activityRepo.find({
      where: { schoolId, isActive: true },
      order: { name: 'ASC' },
    });

    if (activities.length === 0) return [];

    const activityIds = activities.map(a => a.id);

    const records = await this.attendanceRepo
      .createQueryBuilder('att')
      .select('att.activityId', 'activityId')
      .addSelect('SUM(CASE WHEN att.status IN (\'PRESENT\', \'LATE\') THEN 1 ELSE 0 END)', 'present')
      .addSelect('COUNT(*)', 'total')
      .where('att.schoolId = :schoolId', { schoolId })
      .andWhere('att.activityId IN (:...activityIds)', { activityIds })
      .groupBy('att.activityId')
      .getRawMany<{ activityId: string; present: string; total: string }>();

    const rateMap = new Map<string, number>();
    for (const row of records) {
      const total   = Number(row.total);
      const present = Number(row.present);
      rateMap.set(row.activityId, total > 0 ? Math.round((present / total) * 100) : 0);
    }

    return activities.map(a => ({
      activityId:   a.id,
      activityName: a.name,
      rate:         rateMap.get(a.id) ?? 0,
      trend:        'STABLE', // trend computation would need historical snapshots; placeholder
    }));
  }

  async recordAttendance(schoolId: string, data: RecordAttendanceData): Promise<EcaAttendanceRecord[]> {
    const records = data.entries.map(entry =>
      this.attendanceRepo.create({
        schoolId,
        activityId:  data.activityId,
        sessionDate: data.sessionDate,
        studentId:   entry.studentId,
        status:      entry.status,
      }),
    );
    return this.attendanceRepo.save(records);
  }

  // ── Patrons ────────────────────────────────────────────────────────────────

  async getPatrons(schoolId: string): Promise<PatronRow[]> {
    const activities = await this.activityRepo.find({
      where: { schoolId, isActive: true },
      order: { patronName: 'ASC' },
    });

    const patronMap = new Map<string, { staffName: string; activities: string[] }>();

    for (const activity of activities) {
      if (!activity.patronId || !activity.patronName) continue;

      const existing = patronMap.get(activity.patronId);
      if (existing) {
        existing.activities.push(activity.name);
      } else {
        patronMap.set(activity.patronId, {
          staffName:  activity.patronName,
          activities: [activity.name],
        });
      }
    }

    return Array.from(patronMap.values()).map(p => ({
      staffName:   p.staffName,
      activities:  p.activities,
      reportCount: 0,
    }));
  }

  // ── Leadership ─────────────────────────────────────────────────────────────

  async getLeadership(schoolId: string): Promise<EcaActivity[]> {
    return this.activityRepo.find({
      where: { schoolId, category: 'LEADERSHIP', isActive: true },
      order: { name: 'ASC' },
    });
  }
}
