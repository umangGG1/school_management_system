import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly repo: Repository<CalendarEvent>,
  ) {}

  async create(schoolId: string, createdById: string, dto: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.repo.save(this.repo.create({ ...dto, schoolId, createdById }));
  }

  async findByMonth(schoolId: string, year: number, month: number): Promise<CalendarEvent[]> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    return this.repo.find({
      where: { schoolId, isDeleted: false, date: Between(start, end) as any },
      order: { date: 'ASC' },
    });
  }

  async findUpcoming(schoolId: string, days = 14): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().slice(0, 10);
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureStr = future.toISOString().slice(0, 10);
    return this.repo.find({
      where: { schoolId, isDeleted: false, date: Between(today, futureStr) as any },
      order: { date: 'ASC' },
      take: 20,
    });
  }

  async findTerm(schoolId: string, termStart: string, termEnd: string): Promise<CalendarEvent[]> {
    return this.repo.find({
      where: { schoolId, isDeleted: false, date: Between(termStart, termEnd) as any },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string, schoolId: string): Promise<CalendarEvent> {
    const item = await this.repo.findOne({ where: { id, schoolId, isDeleted: false } });
    if (!item) throw new NotFoundException(`Event ${id} not found`);
    return item;
  }

  async update(id: string, schoolId: string, dto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const item = await this.findOne(id, schoolId);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const item = await this.findOne(id, schoolId);
    item.isDeleted = true;
    await this.repo.save(item);
  }
}
