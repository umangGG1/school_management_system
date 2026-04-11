import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExamTimetable } from './exam-timetable.entity';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

@Entity('invigilation_assignments')
export class InvigilationAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamTimetable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_slot_id' })
  examSlot: ExamTimetable;

  @Column({ name: 'exam_slot_id' })
  examSlotId: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invigilator_id' })
  invigilator: User;

  @Column({ name: 'invigilator_id' })
  invigilatorId: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: User;

  @Column({ name: 'assigned_by_id', nullable: true })
  assignedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
