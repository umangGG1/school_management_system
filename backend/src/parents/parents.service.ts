import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { AcademicService } from '../academic/academic.service';
import { FinanceService } from '../finance/finance.service';
import { ExamService } from '../exam/exam.service';
import { MessagingService } from '../messaging/messaging.service';
import { MessageCategory } from '../messaging/entities/message.entity';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly academicService: AcademicService,
    private readonly financeService: FinanceService,
    private readonly examService: ExamService,
    private readonly messagingService: MessagingService,
  ) {}

  // ── Helper ─────────────────────────────────────────────────────────────────

  /**
   * Find the child student record linked to this parent user.
   * The Student entity stores parentEmail (a string), so we resolve the
   * parent user's email first then query students.parentEmail.
   */
  private async resolveParentUser(parentUserId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: parentUserId } });
    if (!user) throw new NotFoundException('Parent user not found');
    return user;
  }

  // ── Public Methods ─────────────────────────────────────────────────────────

  async getChild(parentUserId: string, schoolId: string): Promise<Student> {
    const parent = await this.resolveParentUser(parentUserId);

    const student = await this.studentRepo.findOne({
      where: { parentEmail: parent.email, schoolId },
      relations: ['class'],
    });
    if (!student) throw new NotFoundException('No child found linked to this parent account');
    return student;
  }

  async getChildMarks(parentUserId: string, schoolId: string) {
    const child = await this.getChild(parentUserId, schoolId);
    return this.examService.getStudentResults(child.id, schoolId);
  }

  async getChildAttendance(parentUserId: string, schoolId: string) {
    const child = await this.getChild(parentUserId, schoolId);
    return this.academicService.getStudentAttendance(child.id, schoolId);
  }

  async getChildBalance(parentUserId: string, schoolId: string) {
    const child = await this.getChild(parentUserId, schoolId);
    return this.financeService.getStudentBalance(child.id, schoolId);
  }

  async sendMessage(
    parentUserId: string,
    schoolId: string,
    data: { recipientId: string; subject: string; message: string; category?: MessageCategory },
  ) {
    return this.messagingService.sendMessage({
      schoolId,
      senderId: parentUserId,
      recipientId: data.recipientId,
      subject: data.subject,
      body: data.message,
      category: data.category ?? MessageCategory.GENERAL,
    });
  }
}
