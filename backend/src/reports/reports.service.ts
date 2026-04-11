import { Injectable } from '@nestjs/common';
import { AcademicService } from '../academic/academic.service';
import { FinanceService }  from '../finance/finance.service';
import { BoardingService } from '../boarding/boarding.service';
import { MedicalService }  from '../medical/medical.service';
import { SecurityService } from '../security/security.service';
import { StaffService }    from '../staff/staff.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly academicService: AcademicService,
    private readonly financeService:  FinanceService,
    private readonly boardingService: BoardingService,
    private readonly medicalService:  MedicalService,
    private readonly securityService: SecurityService,
    private readonly staffService:    StaffService,
  ) {}

  // ── Academic Report ─────────────────────────────────────────────────────────

  async academicReport(schoolId: string, term: string, academicYear: string, classId?: string) {
    const [marks, performanceByClass, attendanceSummary] = await Promise.all([
      this.academicService.findMarks(schoolId, classId, undefined, term, academicYear),
      this.academicService.classPerformanceSummary(schoolId, term, academicYear),
      classId
        ? this.academicService.getAttendanceSummaryByClass(classId, schoolId, term, academicYear)
        : null,
    ]);

    return {
      term,
      academicYear,
      generatedAt: new Date().toISOString(),
      performanceByClass,
      totalAssessments: marks.length,
      attendanceSummary,
    };
  }

  // ── Finance Report ──────────────────────────────────────────────────────────

  async financeReport(schoolId: string, term: string, academicYear: string) {
    const [collectionSummary, defaulters, expenseSummary] = await Promise.all([
      this.financeService.collectionSummary(schoolId, term, academicYear),
      this.financeService.getDefaulters(schoolId, term, academicYear),
      this.financeService.expenseSummary(schoolId, term, academicYear),
    ]);

    return {
      term,
      academicYear,
      generatedAt: new Date().toISOString(),
      feesCollection: {
        termTarget:     collectionSummary.termTarget,
        collected:      collectionSummary.collected,
        collectionRate: collectionSummary.collectionRate,
        byClass:        collectionSummary.byClass,
      },
      arrears: {
        count:        defaulters.length,
        totalBalance: defaulters.reduce((s, d) => s + d.balance, 0),
        defaulters:   defaulters.slice(0, 50),  // cap at 50 for report
      },
      expenditure: expenseSummary,
    };
  }

  // ── Boarding Report ─────────────────────────────────────────────────────────

  async boardingReport(schoolId: string) {
    const now = new Date();

    const [boardingSummary, incidents, medStats, referrals, securityOverview] = await Promise.all([
      this.boardingService.summary(schoolId),
      this.boardingService.findIncidents(schoolId),
      this.medicalService.stats(schoolId),
      this.medicalService.findReferrals(schoolId),
      this.securityService.overview(schoolId),
    ]);

    const monthlyHealth = await this.medicalService.monthlyReport(
      schoolId, now.getFullYear(), now.getMonth() + 1,
    );

    return {
      generatedAt: now.toISOString(),
      boarding: boardingSummary,
      dormIncidents: {
        total: incidents.length,
        recent: incidents.slice(0, 10),
      },
      health: {
        stats: medStats,
        monthlyVisits: monthlyHealth,
        hospitalReferrals: referrals.length,
      },
      security: securityOverview,
    };
  }

  // ── Admin / Staff Report ────────────────────────────────────────────────────

  async adminReport(schoolId: string, term: string, academicYear: string) {
    const [staff, attendanceSummary, leaves, actions] = await Promise.all([
      this.staffService.findAll(schoolId),
      this.staffService.todayAttendanceSummary(schoolId),
      this.staffService.findLeaves(schoolId),
      this.staffService.findActions(schoolId),
    ]);

    return {
      term,
      academicYear,
      generatedAt: new Date().toISOString(),
      staffRegister: {
        total: staff.length,
        byDepartment: this._groupBy(staff, 'department'),
        staff: staff.map(s => ({
          id: s.id, name: `${s.firstName} ${s.lastName}`,
          position: s.position, department: s.department, isActive: s.isActive,
        })),
      },
      attendanceToday: attendanceSummary,
      leavesSummary: {
        total:    leaves.length,
        pending:  leaves.filter(l => l.status === 'PENDING').length,
        approved: leaves.filter(l => l.status === 'APPROVED').length,
      },
      disciplinaryActions: actions.length,
    };
  }

  private _groupBy<T>(arr: T[], key: keyof T): Record<string, number> {
    return arr.reduce((acc, item) => {
      const k = String(item[key] ?? 'Unknown');
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
