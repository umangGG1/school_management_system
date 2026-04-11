import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CounselingService } from './counseling.service';
import { CaseStatus } from './entities/counseling.entities';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('counseling')
@UseGuards(JwtAuthGuard)
export class CounselingController {
  constructor(private readonly counselingService: CounselingService) {}

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.counselingService.getSummary(user.schoolId);
  }

  // ── Cases ──────────────────────────────────────────────────────────────────

  @Get('cases')
  findCases(@CurrentUser() user: JwtPayload, @Query('status') status: CaseStatus) {
    return this.counselingService.findCases(user.schoolId, status);
  }

  @Get('cases/student/:studentId')
  findStudentCases(@Param('studentId') studentId: string, @CurrentUser() user: JwtPayload) {
    return this.counselingService.findCasesByStudent(studentId, user.schoolId);
  }

  @Post('cases')
  createCase(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.createCase({ ...body, schoolId: user.schoolId, counselorId: user.sub });
  }

  @Patch('cases/:id')
  updateCase(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.updateCase(id, user.schoolId, body);
  }

  // ── Case Notes ─────────────────────────────────────────────────────────────

  @Get('cases/:caseId/notes')
  findNotes(@Param('caseId') caseId: string, @CurrentUser() user: JwtPayload) {
    return this.counselingService.findNotes(caseId, user.schoolId);
  }

  @Post('cases/:caseId/notes')
  addNote(@Param('caseId') caseId: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.addNote({ ...body, caseId, schoolId: user.schoolId, authorId: user.sub });
  }

  @Patch('notes/:id')
  updateNote(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.updateNote(id, user.schoolId, body);
  }

  // ── Sessions ───────────────────────────────────────────────────────────────

  @Get('sessions')
  findSessions(@CurrentUser() user: JwtPayload, @Query('caseId') caseId: string) {
    return this.counselingService.findSessions(user.schoolId, caseId);
  }

  @Post('sessions')
  createSession(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.createSession({ ...body, schoolId: user.schoolId, counselorId: user.sub });
  }

  // ── Safeguarding ───────────────────────────────────────────────────────────

  @Get('safeguarding')
  findSafeguarding(@CurrentUser() user: JwtPayload) {
    return this.counselingService.findSafeguardingReports(user.schoolId);
  }

  @Post('safeguarding')
  createSafeguarding(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.createSafeguardingReport({ ...body, schoolId: user.schoolId, reportedById: user.sub });
  }

  @Patch('safeguarding/:id')
  updateSafeguarding(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.updateSafeguardingReport(id, user.schoolId, body);
  }

  // ── OVC ────────────────────────────────────────────────────────────────────

  @Get('ovc')
  findOVC(@CurrentUser() user: JwtPayload) {
    return this.counselingService.findOVC(user.schoolId);
  }

  @Post('ovc')
  registerOVC(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.registerOVC({ ...body, schoolId: user.schoolId, registeredById: user.sub });
  }

  @Patch('ovc/:id')
  updateOVC(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.updateOVC(id, user.schoolId, body);
  }

  // ── Health Referrals ───────────────────────────────────────────────────────

  @Get('health-referrals')
  findReferrals(@CurrentUser() user: JwtPayload, @Query('studentId') studentId: string) {
    return this.counselingService.findHealthReferrals(user.schoolId, studentId);
  }

  @Post('health-referrals')
  createReferral(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.createHealthReferral({ ...body, schoolId: user.schoolId, referredById: user.sub });
  }

  @Patch('health-referrals/:id')
  updateReferral(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.counselingService.updateHealthReferral(id, user.schoolId, body);
  }
}
