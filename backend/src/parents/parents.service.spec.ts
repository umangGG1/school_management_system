import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { Student } from '../students/entities/student.entity';
import { User }    from '../users/entities/user.entity';
import { AcademicService } from '../academic/academic.service';
import { FinanceService }  from '../finance/finance.service';
import { ExamService }     from '../exam/exam.service';
import { MessagingService } from '../messaging/messaging.service';
import { MessageCategory }  from '../messaging/entities/message.entity';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRepo = () => ({
  findOne: jest.fn(),
  find:    jest.fn(),
  save:    jest.fn(),
  create:  jest.fn((x: unknown) => x),
});

const SCHOOL   = 'school-001';
const PARENT_UID = 'parent-user-001';
const PARENT_EMAIL = 'parent@home.ug';

const parentUser: Partial<User> = {
  id:    PARENT_UID,
  email: PARENT_EMAIL,
};

const child: Partial<Student> = {
  id:          'stu-001',
  schoolId:    SCHOOL,
  parentEmail: PARENT_EMAIL,
};

describe('ParentsService', () => {
  let service:      ParentsService;
  let studentRepo:  ReturnType<typeof mockRepo>;
  let userRepo:     ReturnType<typeof mockRepo>;
  let academicSvc:  Record<string, jest.Mock>;
  let financeSvc:   Record<string, jest.Mock>;
  let examSvc:      Record<string, jest.Mock>;
  let messagingSvc: Record<string, jest.Mock>;

  beforeEach(async () => {
    studentRepo  = mockRepo();
    userRepo     = mockRepo();
    academicSvc  = { getStudentAttendance: jest.fn() };
    financeSvc   = { getStudentBalance:    jest.fn() };
    examSvc      = { getStudentResults:    jest.fn() };
    messagingSvc = { sendMessage:          jest.fn() };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: getRepositoryToken(User),    useValue: userRepo },
        { provide: AcademicService,  useValue: academicSvc },
        { provide: FinanceService,   useValue: financeSvc },
        { provide: ExamService,      useValue: examSvc },
        { provide: MessagingService, useValue: messagingSvc },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
  });

  // ── getChild ───────────────────────────────────────────────────────────────

  describe('getChild', () => {
    it('resolves child by matching parentEmail', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(child);

      const result = await service.getChild(PARENT_UID, SCHOOL);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: PARENT_UID } });
      expect(studentRepo.findOne).toHaveBeenCalledWith({
        where: { parentEmail: PARENT_EMAIL, schoolId: SCHOOL },
        relations: ['class'],
      });
      expect(result.id).toBe('stu-001');
    });

    it('throws NotFoundException when parent user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getChild(PARENT_UID, SCHOOL)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when no child linked to parent email', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(null);

      await expect(service.getChild(PARENT_UID, SCHOOL)).rejects.toThrow(NotFoundException);
    });
  });

  // ── getChildMarks ──────────────────────────────────────────────────────────

  describe('getChildMarks', () => {
    it('delegates to ExamService.getStudentResults', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(child);
      const marks = [{ subject: 'Math', score: 90 }];
      examSvc.getStudentResults.mockResolvedValue(marks);

      const result = await service.getChildMarks(PARENT_UID, SCHOOL);

      expect(examSvc.getStudentResults).toHaveBeenCalledWith('stu-001', SCHOOL);
      expect(result).toEqual(marks);
    });

    it('throws NotFoundException when no child found', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(null);

      await expect(service.getChildMarks(PARENT_UID, SCHOOL)).rejects.toThrow(NotFoundException);
    });
  });

  // ── getChildAttendance ─────────────────────────────────────────────────────

  describe('getChildAttendance', () => {
    it('delegates to AcademicService.getStudentAttendance', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(child);
      const attendance = { present: 40, absent: 5, rate: 88.9 };
      academicSvc.getStudentAttendance.mockResolvedValue(attendance);

      const result = await service.getChildAttendance(PARENT_UID, SCHOOL);

      expect(academicSvc.getStudentAttendance).toHaveBeenCalledWith('stu-001', SCHOOL);
      expect(result).toEqual(attendance);
    });
  });

  // ── getChildBalance ────────────────────────────────────────────────────────

  describe('getChildBalance', () => {
    it('delegates to FinanceService.getStudentBalance', async () => {
      userRepo.findOne.mockResolvedValue(parentUser);
      studentRepo.findOne.mockResolvedValue(child);
      const balance = { totalOwed: 500000, totalPaid: 300000, outstanding: 200000 };
      financeSvc.getStudentBalance.mockResolvedValue(balance);

      const result = await service.getChildBalance(PARENT_UID, SCHOOL);

      expect(financeSvc.getStudentBalance).toHaveBeenCalledWith('stu-001', SCHOOL);
      expect(result).toEqual(balance);
    });
  });

  // ── sendMessage ────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('delegates to MessagingService with correct payload', async () => {
      const sentMsg = { id: 'msg-1', subject: 'Absence notice' };
      messagingSvc.sendMessage.mockResolvedValue(sentMsg);

      const result = await service.sendMessage(PARENT_UID, SCHOOL, {
        recipientId: 'teacher-001',
        subject:     'Absence notice',
        message:     'My child was sick.',
        category:    MessageCategory.GENERAL,
      });

      expect(messagingSvc.sendMessage).toHaveBeenCalledWith({
        schoolId:    SCHOOL,
        senderId:    PARENT_UID,
        recipientId: 'teacher-001',
        subject:     'Absence notice',
        body:        'My child was sick.',
        category:    MessageCategory.GENERAL,
      });
      expect(result).toEqual(sentMsg);
    });

    it('defaults category to GENERAL when not provided', async () => {
      messagingSvc.sendMessage.mockResolvedValue({});

      await service.sendMessage(PARENT_UID, SCHOOL, {
        recipientId: 'teacher-001',
        subject:     'Question',
        message:     'When is next PTA?',
      });

      expect(messagingSvc.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ category: MessageCategory.GENERAL }),
      );
    });
  });
});
