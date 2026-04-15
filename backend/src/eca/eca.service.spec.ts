import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EcaService } from './eca.service';
import { EcaActivity } from './entities/eca-activity.entity';
import { EcaCompetition } from './entities/eca-competition.entity';
import { EcaAttendanceRecord } from './entities/eca-attendance.entity';

// ── Repository mock factory ────────────────────────────────────────────────────

const qb = () => ({
  select:     jest.fn().mockReturnThis(),
  addSelect:  jest.fn().mockReturnThis(),
  where:      jest.fn().mockReturnThis(),
  andWhere:   jest.fn().mockReturnThis(),
  groupBy:    jest.fn().mockReturnThis(),
  orderBy:    jest.fn().mockReturnThis(),
  getCount:   jest.fn().mockResolvedValue(0),
  getRawMany: jest.fn().mockResolvedValue([]),
  getMany:    jest.fn().mockResolvedValue([]),
});

const mockRepo = () => ({
  find:               jest.fn(),
  findOne:            jest.fn(),
  save:               jest.fn(),
  create:             jest.fn((x: unknown) => x),
  createQueryBuilder: jest.fn(() => qb()),
});

const SCHOOL = 'school-001';

describe('EcaService', () => {
  let service:        EcaService;
  let activityRepo:   ReturnType<typeof mockRepo>;
  let competitionRepo:ReturnType<typeof mockRepo>;
  let attendanceRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    activityRepo    = mockRepo();
    competitionRepo = mockRepo();
    attendanceRepo  = mockRepo();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EcaService,
        { provide: getRepositoryToken(EcaActivity),         useValue: activityRepo },
        { provide: getRepositoryToken(EcaCompetition),      useValue: competitionRepo },
        { provide: getRepositoryToken(EcaAttendanceRecord), useValue: attendanceRepo },
      ],
    }).compile();

    service = module.get<EcaService>(EcaService);
  });

  // ── getSummary ─────────────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('returns zeroed summary when no activities exist', async () => {
      activityRepo.find.mockResolvedValue([]);

      // competition count query builder
      const cqb = qb();
      cqb.getCount.mockResolvedValue(0);
      competitionRepo.createQueryBuilder.mockReturnValue(cqb);

      const result = await service.getSummary(SCHOOL);

      expect(result.totalActivities).toBe(0);
      expect(result.totalEnrolled).toBe(0);
      expect(result.competitions).toBe(0);
      // default avgAttendance when no activities
      expect(result.avgAttendance).toBe(80);
    });

    it('sums memberCount from all active activities', async () => {
      const activities = [
        { id: 'a1', memberCount: 30, isActive: true },
        { id: 'a2', memberCount: 20, isActive: true },
      ];
      activityRepo.find.mockResolvedValue(activities);

      const cqb = qb();
      cqb.getCount.mockResolvedValue(3);
      competitionRepo.createQueryBuilder.mockReturnValue(cqb);

      // attendance query builder — no records → default 80
      const aqb = qb();
      aqb.getRawMany.mockResolvedValue([]);
      attendanceRepo.createQueryBuilder.mockReturnValue(aqb);

      const result = await service.getSummary(SCHOOL);

      expect(result.totalActivities).toBe(2);
      expect(result.totalEnrolled).toBe(50);
      expect(result.competitions).toBe(3);
      expect(result.avgAttendance).toBe(80); // no records → default
    });

    it('calculates avgAttendance from attendance records', async () => {
      const activities = [
        { id: 'a1', memberCount: 10 },
        { id: 'a2', memberCount: 5 },
      ];
      activityRepo.find.mockResolvedValue(activities);

      const cqb = qb();
      cqb.getCount.mockResolvedValue(0);
      competitionRepo.createQueryBuilder.mockReturnValue(cqb);

      const aqb = qb();
      aqb.getRawMany.mockResolvedValue([
        { activityId: 'a1', present: '80', total: '100' },  // 80%
        { activityId: 'a2', present: '60', total: '100' },  // 60%
      ]);
      attendanceRepo.createQueryBuilder.mockReturnValue(aqb);

      const result = await service.getSummary(SCHOOL);

      expect(result.avgAttendance).toBe(70); // (80 + 60) / 2
    });
  });

  // ── getActivities ──────────────────────────────────────────────────────────

  describe('getActivities', () => {
    it('returns active activities sorted by name', async () => {
      const activities = [
        { id: 'a1', name: 'Chess Club', isActive: true },
        { id: 'a2', name: 'Athletics', isActive: true },
      ];
      activityRepo.find.mockResolvedValue(activities);

      const result = await service.getActivities(SCHOOL);

      expect(result).toHaveLength(2);
      expect(activityRepo.find).toHaveBeenCalledWith({
        where: { schoolId: SCHOOL, isActive: true },
        order: { name: 'ASC' },
      });
    });

    it('returns empty array when school has no activities', async () => {
      activityRepo.find.mockResolvedValue([]);
      expect(await service.getActivities(SCHOOL)).toEqual([]);
    });
  });

  // ── createActivity ─────────────────────────────────────────────────────────

  describe('createActivity', () => {
    it('creates activity with the given schoolId', async () => {
      const saved = { id: 'a-new', schoolId: SCHOOL, name: 'Drama Club', category: 'ARTS' };
      activityRepo.save.mockResolvedValue(saved);

      const result = await service.createActivity(SCHOOL, { name: 'Drama Club', category: 'ARTS' });

      expect(activityRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: SCHOOL, name: 'Drama Club' }),
      );
      expect(result.id).toBe('a-new');
    });
  });

  // ── getCompetitions ────────────────────────────────────────────────────────

  describe('getCompetitions', () => {
    it('returns competitions for the school ordered by date desc', async () => {
      const comps = [
        { id: 'c1', eventName: 'Football Final', eventDate: '2026-03-20' },
        { id: 'c2', eventName: 'Chess Tourney',  eventDate: '2026-02-10' },
      ];
      competitionRepo.find.mockResolvedValue(comps);

      const result = await service.getCompetitions(SCHOOL);

      expect(result).toHaveLength(2);
      expect(competitionRepo.find).toHaveBeenCalledWith({
        where: { schoolId: SCHOOL },
        order: { eventDate: 'DESC' },
      });
    });
  });

  // ── createCompetition ──────────────────────────────────────────────────────

  describe('createCompetition', () => {
    it('saves competition linked to schoolId', async () => {
      const saved = { id: 'c-new', schoolId: SCHOOL, eventName: 'Basketball Cup' };
      competitionRepo.save.mockResolvedValue(saved);

      const result = await service.createCompetition(SCHOOL, { eventName: 'Basketball Cup', activityName: 'Basketball' });

      expect(competitionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: SCHOOL }),
      );
      expect(result.eventName).toBe('Basketball Cup');
    });
  });

  // ── getAttendanceRates ─────────────────────────────────────────────────────

  describe('getAttendanceRates', () => {
    it('returns empty array when there are no active activities', async () => {
      activityRepo.find.mockResolvedValue([]);
      expect(await service.getAttendanceRates(SCHOOL)).toEqual([]);
    });

    it('computes attendance rate per activity', async () => {
      activityRepo.find.mockResolvedValue([
        { id: 'a1', name: 'Football' },
        { id: 'a2', name: 'Chess' },
      ]);

      const aqb = qb();
      aqb.getRawMany.mockResolvedValue([
        { activityId: 'a1', present: '90', total: '100' },  // 90%
        { activityId: 'a2', present: '40', total: '50' },   // 80%
      ]);
      attendanceRepo.createQueryBuilder.mockReturnValue(aqb);

      const result = await service.getAttendanceRates(SCHOOL);

      expect(result).toHaveLength(2);
      const football = result.find(r => r.activityName === 'Football');
      expect(football?.rate).toBe(90);
      const chess = result.find(r => r.activityName === 'Chess');
      expect(chess?.rate).toBe(80);
    });

    it('defaults to rate 0 for activities with no attendance records', async () => {
      activityRepo.find.mockResolvedValue([{ id: 'a1', name: 'Drama' }]);

      const aqb = qb();
      aqb.getRawMany.mockResolvedValue([]); // no records
      attendanceRepo.createQueryBuilder.mockReturnValue(aqb);

      const result = await service.getAttendanceRates(SCHOOL);

      expect(result[0].rate).toBe(0);
    });
  });

  // ── recordAttendance ───────────────────────────────────────────────────────

  describe('recordAttendance', () => {
    it('creates one record per entry and saves all', async () => {
      const entries = [
        { studentId: 'stu-1', status: 'PRESENT' },
        { studentId: 'stu-2', status: 'ABSENT' },
      ];
      const saved = entries.map((e, i) => ({ id: `att-${i}`, ...e }));
      attendanceRepo.save.mockResolvedValue(saved);

      const result = await service.recordAttendance(SCHOOL, {
        activityId:  'a1',
        sessionDate: '2026-04-15',
        entries,
      });

      expect(attendanceRepo.create).toHaveBeenCalledTimes(2);
      expect(attendanceRepo.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toHaveLength(2);
    });
  });

  // ── getPatrons ─────────────────────────────────────────────────────────────

  describe('getPatrons', () => {
    it('groups activities by patronId into PatronRow list', async () => {
      activityRepo.find.mockResolvedValue([
        { id: 'a1', name: 'Football', patronId: 'staff-1', patronName: 'Mr. Okello' },
        { id: 'a2', name: 'Athletics', patronId: 'staff-1', patronName: 'Mr. Okello' },
        { id: 'a3', name: 'Drama',     patronId: 'staff-2', patronName: 'Ms. Akello' },
      ]);

      const result = await service.getPatrons(SCHOOL);

      expect(result).toHaveLength(2);
      const okello = result.find(p => p.staffName === 'Mr. Okello');
      expect(okello?.activities).toHaveLength(2);
      expect(okello?.activities).toContain('Football');
      expect(okello?.activities).toContain('Athletics');
    });

    it('skips activities with no patronId', async () => {
      activityRepo.find.mockResolvedValue([
        { id: 'a1', name: 'Chess', patronId: null, patronName: null },
      ]);
      const result = await service.getPatrons(SCHOOL);
      expect(result).toHaveLength(0);
    });
  });

  // ── getLeadership ──────────────────────────────────────────────────────────

  describe('getLeadership', () => {
    it('queries only LEADERSHIP category activities', async () => {
      activityRepo.find.mockResolvedValue([{ id: 'a1', name: 'Student Council', category: 'LEADERSHIP' }]);

      await service.getLeadership(SCHOOL);

      expect(activityRepo.find).toHaveBeenCalledWith({
        where: { schoolId: SCHOOL, category: 'LEADERSHIP', isActive: true },
        order: { name: 'ASC' },
      });
    });
  });
});
