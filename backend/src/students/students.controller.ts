import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StudentsService } from './students.service';
import { DisciplineStatus } from './entities/student-discipline.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.studentsService.findAll(user.schoolId, page, limit);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.studentsService.create({ ...body, schoolId: user.schoolId });
  }

  @Get('count')
  async count(@CurrentUser() user: JwtPayload) {
    const total = await this.studentsService.countBySchool(user.schoolId);
    return { total };
  }

  @Get('discipline')
  findAllDiscipline(@CurrentUser() user: JwtPayload, @Query('status') status: DisciplineStatus) {
    return this.studentsService.findAllDiscipline(user.schoolId, status);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.studentsService.findByUserId(user.sub, user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.findOne(id, user.schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.studentsService.update(id, user.schoolId, body);
  }

  @Get(':id/discipline')
  findStudentDiscipline(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studentsService.findDisciplineByStudent(id, user.schoolId);
  }

  @Post(':id/discipline')
  recordDiscipline(@Param('id') studentId: string, @CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.studentsService.recordDisciplineAction({
      ...body,
      studentId,
      schoolId: user.schoolId,
      issuedById: user.sub,
    });
  }

  @Patch(':id/discipline/:disciplineId')
  updateDiscipline(
    @Param('disciplineId') disciplineId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.studentsService.updateDisciplineAction(disciplineId, user.schoolId, body);
  }
}
