import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

export enum CalendarEventType {
  EXAM = 'EXAM',
  HOLIDAY = 'HOLIDAY',
  MEETING = 'MEETING',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  BOARDING = 'BOARDING',
  ACADEMIC = 'ACADEMIC',
  OTHER = 'OTHER',
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ type: 'enum', enum: CalendarEventType, default: CalendarEventType.OTHER })
  type: CalendarEventType;

  @Column({ default: false })
  allDay: boolean;

  @Column({ nullable: true, name: 'class_id' })
  classId: string;

  @Column({ type: 'text', nullable: true })
  venue: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true, name: 'created_by_id' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
