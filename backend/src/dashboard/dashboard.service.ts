import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { StaffService } from '../staff/staff.service';
import { FinanceService } from '../finance/finance.service';
import { AcademicService } from '../academic/academic.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { ActivityService } from '../activity/activity.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { CalendarService } from '../calendar/calendar.service';
import { BoardingService } from '../boarding/boarding.service';
import { SecurityService } from '../security/security.service';
import { MedicalService } from '../medical/medical.service';
import { AppCacheService, TTL } from '../common/cache/cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly staffService: StaffService,
    private readonly financeService: FinanceService,
    private readonly academicService: AcademicService,
    private readonly approvalsService: ApprovalsService,
    private readonly activityService: ActivityService,
    private readonly announcementsService: AnnouncementsService,
    private readonly calendarService: CalendarService,
    private readonly boardingService: BoardingService,
    private readonly securityService: SecurityService,
    private readonly medicalService: MedicalService,
    private readonly cache: AppCacheService,
  ) {}

  async headTeacherSummary(schoolId: string, term: string, academicYear: string) {
    const cacheKey = `dashboard:ht:${schoolId}:${term}:${academicYear}`;
    return this.cache.getOrSet(cacheKey, () => this._headTeacherSummary(schoolId, term, academicYear), TTL.DASHBOARD);
  }

  private async _headTeacherSummary(schoolId: string, term: string, academicYear: string) {
    const [
      totalStudents, staffAttendance, collectionSummary, classPerformance,
      pendingApprovals, recentActivity, pinnedAnnouncements, upcomingEvents,
      boardingSummary, securityOverview, medicalStats,
    ] = await Promise.all([
      this.studentsService.countBySchool(schoolId),
      this.staffService.todayAttendanceSummary(schoolId),
      this.financeService.collectionSummary(schoolId, term, academicYear),
      this.academicService.classPerformanceSummary(schoolId, term, academicYear),
      this.approvalsService.findPending(schoolId),
      this.activityService.getRecent(schoolId, 6),
      this.announcementsService.getRecentForDashboard(schoolId, 3),
      this.calendarService.findUpcoming(schoolId, 14),
      this.boardingService.summary(schoolId),
      this.securityService.overview(schoolId),
      this.medicalService.stats(schoolId),
    ]);

    const avgPerformance =
      classPerformance.length > 0
        ? Math.round(classPerformance.reduce((sum, c) => sum + c.avgScore, 0) / classPerformance.length)
        : 0;

    return {
      stats: {
        totalStudents,
        feeCollectionRate: collectionSummary.collectionRate,
        staffPresent: staffAttendance.present,
        staffTotal: staffAttendance.total,
        avgPerformance,
      },
      feeCollection: {
        termTarget: collectionSummary.termTarget,
        collected: collectionSummary.collected,
        collectionRate: collectionSummary.collectionRate,
        byClass: collectionSummary.byClass,
      },
      classPerformance,
      boarding: boardingSummary,
      security: securityOverview,
      medical: medicalStats,
      pendingApprovals: pendingApprovals.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        urgency: a.urgency,
        requestedBy: a.requestedBy ? `${a.requestedBy.firstName} ${a.requestedBy.lastName}` : 'Unknown',
        createdAt: a.createdAt,
      })),
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        type: log.type,
        description: log.description,
        performedBy: log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System',
        createdAt: log.createdAt,
      })),
      recentAnnouncements: pinnedAnnouncements.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        isPinned: a.isPinned,
        createdAt: a.createdAt,
      })),
      upcomingEvents: upcomingEvents.slice(0, 5).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        type: e.type,
      })),
    };
  }

  async academicSummary(schoolId: string, term: string, academicYear: string) {
    const cacheKey = `dashboard:academic:${schoolId}:${term}:${academicYear}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [classPerformance, studentCount] = await Promise.all([
          this.academicService.classPerformanceSummary(schoolId, term, academicYear),
          this.studentsService.countBySchool(schoolId),
        ]);
        return { classPerformance, totalStudents: studentCount };
      },
      TTL.DASHBOARD,
    );
  }

  async staffSummary(schoolId: string) {
    const cacheKey = `dashboard:staff:${schoolId}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [staffList, attendance] = await Promise.all([
          this.staffService.findAll(schoolId),
          this.staffService.todayAttendanceSummary(schoolId),
        ]);
        return { staff: staffList, attendance };
      },
      TTL.SHORT,
    );
  }

  async financeSummary(schoolId: string, term: string, academicYear: string) {
    const cacheKey = `dashboard:finance:${schoolId}:${term}:${academicYear}`;
    return this.cache.getOrSet(
      cacheKey,
      () => this.financeService.collectionSummary(schoolId, term, academicYear),
      TTL.DASHBOARD,
    );
  }

  async boardingSummary(schoolId: string) {
    const cacheKey = `dashboard:boarding:${schoolId}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [summary, medical] = await Promise.all([
          this.boardingService.summary(schoolId),
          this.medicalService.stats(schoolId),
        ]);
        return { ...summary, sickBay: medical };
      },
      TTL.SHORT,
    );
  }

  async securitySummary(schoolId: string, date?: string) {
    const cacheKey = `dashboard:security:${schoolId}`;
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [overview, incidents] = await Promise.all([
          this.securityService.overview(schoolId),
          this.securityService.findIncidents(schoolId, 'OPEN'),
        ]);
        return { overview, openIncidents: incidents };
      },
      TTL.SHORT,
    );
  }
}
