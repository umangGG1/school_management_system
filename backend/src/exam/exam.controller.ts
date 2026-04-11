import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExamService } from './exam.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // ── Timetable ──────────────────────────────────────────────────────────────

  @Get('timetable')
  getTimetable(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.examService.findTimetable(user.schoolId, term, academicYear);
  }

  @Post('timetable')
  createSlot(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.examService.createTimetableSlot({ ...body, schoolId: user.schoolId, createdById: user.sub });
  }

  @Patch('timetable/:id')
  updateSlot(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.examService.updateTimetableSlot(id, user.schoolId, body);
  }

  @Delete('timetable/:id')
  deleteSlot(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.examService.deleteTimetableSlot(id, user.schoolId);
  }

  @Patch('timetable/publish')
  publishTimetable(
    @CurrentUser() user: JwtPayload,
    @Body() body: { term: string; academicYear: string },
  ) {
    return this.examService.publishTimetable(user.schoolId, body.term, body.academicYear);
  }

  // ── Invigilation ───────────────────────────────────────────────────────────

  @Get('invigilation')
  getInvigilation(@CurrentUser() user: JwtPayload, @Query('term') term: string) {
    return this.examService.findInvigilation(user.schoolId, term);
  }

  @Post('invigilation')
  assignInvigilator(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.examService.assignInvigilator({ ...body, schoolId: user.schoolId, assignedById: user.sub });
  }

  @Delete('invigilation/:id')
  removeInvigilation(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.examService.removeInvigilation(id, user.schoolId);
  }

  // ── Marks ──────────────────────────────────────────────────────────────────

  @Get('marks')
  getMarks(
    @CurrentUser() user: JwtPayload,
    @Query('examSlotId') examSlotId: string,
    @Query('studentId') studentId: string,
  ) {
    return this.examService.findMarks(user.schoolId, examSlotId, studentId);
  }

  @Post('marks/entry')
  enterMark(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.examService.enterMark({ ...body, schoolId: user.schoolId, enteredById: user.sub });
  }

  @Post('marks/bulk-entry')
  bulkEnterMarks(
    @CurrentUser() user: JwtPayload,
    @Body() body: { examSlotId: string; entries: Array<{ studentId: string; marksObtained: number; remarks?: string }> },
  ) {
    return this.examService.bulkEnterMarks(body.entries, body.examSlotId, user.schoolId, user.sub);
  }

  @Patch('marks/:id/verify')
  verifyMark(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.examService.verifyMark(id, user.schoolId, user.sub);
  }

  @Patch('marks/:id/reject')
  rejectMark(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.examService.rejectMark(id, user.schoolId, user.sub);
  }

  @Patch('marks/publish')
  publishMarks(@CurrentUser() user: JwtPayload, @Body() body: { examSlotId: string }) {
    return this.examService.publishMarks(body.examSlotId, user.schoolId);
  }

  // ── Student Results ────────────────────────────────────────────────────────

  @Get('results/student/:studentId')
  getStudentResults(
    @Param('studentId') studentId: string,
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.examService.getStudentResults(studentId, user.schoolId, term, academicYear);
  }

  @Get('results/me')
  getMyResults(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.examService.getStudentResults(user.sub, user.schoolId, term, academicYear);
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  @Get('summary')
  getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.examService.getExamSummary(
      user.schoolId,
      term ?? 'Term 1',
      academicYear ?? currentYear,
    );
  }
}
