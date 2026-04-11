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
import { AcademicService } from './academic.service';
import { AttendanceStatus } from './entities/student-attendance.entity';
import { LessonNoteStatus } from './entities/lesson-note.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('academic')
@UseGuards(JwtAuthGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // ── Classes ────────────────────────────────────────────────────────────────

  @Get('classes')
  findClasses(@CurrentUser() user: JwtPayload) {
    return this.academicService.findClassesBySchool(user.schoolId);
  }

  @Post('classes')
  createClass(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.createClass({ ...body, schoolId: user.schoolId });
  }

  @Patch('classes/:id')
  updateClass(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.updateClass(id, user.schoolId, body);
  }

  // ── Subjects ───────────────────────────────────────────────────────────────

  @Get('subjects')
  findSubjects(@CurrentUser() user: JwtPayload) {
    return this.academicService.findSubjects(user.schoolId);
  }

  @Post('subjects')
  createSubject(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.createSubject({ ...body, schoolId: user.schoolId });
  }

  // ── Performance ────────────────────────────────────────────────────────────

  @Get('performance')
  performance(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.academicService.classPerformanceSummary(
      user.schoolId,
      term ?? 'Term 1',
      academicYear ?? currentYear,
    );
  }

  // ── Marks / Assessments ────────────────────────────────────────────────────

  @Get('marks')
  findMarks(
    @CurrentUser() user: JwtPayload,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.academicService.findMarks(user.schoolId, classId, subjectId, term, academicYear);
  }

  @Get('marks/student/:studentId')
  findStudentMarks(
    @Param('studentId') studentId: string,
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.academicService.findStudentMarks(studentId, user.schoolId, term, academicYear);
  }

  @Get('marks/me')
  findMyMarks(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.academicService.findStudentMarks(user.sub, user.schoolId, term, academicYear);
  }

  @Post('marks/submit')
  submitMark(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.submitMark({ ...body, schoolId: user.schoolId, enteredById: user.sub });
  }

  @Post('marks/bulk-submit')
  bulkSubmitMarks(
    @CurrentUser() user: JwtPayload,
    @Body() body: { entries: Array<{ studentId: string; score: number }>; classId: string; subjectId: string; term: string; academicYear: string; type: string; maxScore: number },
  ) {
    const { entries, ...common } = body;
    return this.academicService.bulkSubmitMarks(entries, { ...common, schoolId: user.schoolId, enteredById: user.sub } as any);
  }

  // ── Attendance ─────────────────────────────────────────────────────────────

  @Post('attendance/mark')
  markAttendance(
    @CurrentUser() user: JwtPayload,
    @Body() body: {
      classId: string;
      date: string;
      entries: Array<{ studentId: string; status: AttendanceStatus }>;
    },
  ) {
    return this.academicService.markAttendance(body.entries, body.classId, user.schoolId, body.date, user.sub);
  }

  @Get('attendance/class/:classId')
  getClassAttendance(
    @Param('classId') classId: string,
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.academicService.getAttendanceByClass(classId, user.schoolId, date ?? today);
  }

  @Get('attendance/class/:classId/summary')
  getClassAttendanceSummary(
    @Param('classId') classId: string,
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const currentYear = new Date().getFullYear().toString();
    return this.academicService.getAttendanceSummaryByClass(classId, user.schoolId, term ?? 'Term 1', academicYear ?? currentYear);
  }

  @Get('attendance/student/:studentId')
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.academicService.getStudentAttendance(studentId, user.schoolId, from, to);
  }

  @Get('attendance/me')
  getMyAttendance(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.academicService.getStudentAttendance(user.sub, user.schoolId, from, to);
  }

  // ── Timetable ──────────────────────────────────────────────────────────────

  @Get('timetable')
  findTimetable(
    @CurrentUser() user: JwtPayload,
    @Query('classId') classId: string,
    @Query('teacherId') teacherId: string,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.academicService.findTimetable(user.schoolId, classId, teacherId, term, academicYear);
  }

  @Post('timetable')
  createTimetableEntry(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.createTimetableEntry({ ...body, schoolId: user.schoolId });
  }

  @Patch('timetable/:id')
  updateTimetableEntry(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.updateTimetableEntry(id, user.schoolId, body);
  }

  @Delete('timetable/:id')
  deleteTimetableEntry(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.academicService.deleteTimetableEntry(id, user.schoolId);
  }

  // ── Cover Lessons ──────────────────────────────────────────────────────────

  @Get('cover-lessons')
  findCoverLessons(@CurrentUser() user: JwtPayload, @Query('date') date: string) {
    return this.academicService.findCoverLessons(user.schoolId, date);
  }

  @Post('cover-lessons')
  createCoverLesson(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.createCoverLesson({ ...body, schoolId: user.schoolId });
  }

  @Patch('cover-lessons/:id/assign')
  assignCoverTeacher(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { coverTeacherId: string },
  ) {
    return this.academicService.assignCoverTeacher(id, user.schoolId, body.coverTeacherId, user.sub);
  }

  // ── Lesson Notes ───────────────────────────────────────────────────────────

  @Get('lesson-notes')
  findLessonNotes(
    @CurrentUser() user: JwtPayload,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Query('teacherId') teacherId: string,
  ) {
    return this.academicService.findLessonNotes(user.schoolId, classId, subjectId, teacherId);
  }

  @Post('lesson-notes')
  createLessonNote(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.createLessonNote({ ...body, schoolId: user.schoolId, teacherId: user.sub });
  }

  @Patch('lesson-notes/:id')
  updateLessonNote(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.academicService.updateLessonNote(id, user.schoolId, body);
  }

  @Patch('lesson-notes/:id/submit')
  submitLessonNote(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.academicService.submitLessonNote(id, user.schoolId);
  }

  @Patch('lesson-notes/:id/review')
  reviewLessonNote(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { status: LessonNoteStatus; comment?: string },
  ) {
    return this.academicService.reviewLessonNote(id, user.schoolId, user.sub, body.status, body.comment);
  }
}
