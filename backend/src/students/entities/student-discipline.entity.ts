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
import { Student } from './student.entity';
import { User } from '../../users/entities/user.entity';

export enum DisciplineActionType {
  VERBAL_WARNING = 'VERBAL_WARNING',
  WRITTEN_WARNING = 'WRITTEN_WARNING',
  DETENTION = 'DETENTION',
  SUSPENSION = 'SUSPENSION',
  EXPULSION = 'EXPULSION',
  PARENT_SUMMONS = 'PARENT_SUMMONS',
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  COUNSELING_REFERRAL = 'COUNSELING_REFERRAL',
}

export enum DisciplineStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  APPEALED = 'APPEALED',
}

@Entity('student_discipline')
export class StudentDiscipline {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @Column({ type: 'enum', enum: DisciplineActionType }) actionType: DisciplineActionType;

  @Column('text') offense: string;

  @Column({ nullable: true, type: 'text' }) actionDescription: string;

  @Column({ type: 'date', nullable: true }) incidentDate: string;

  @Column({ type: 'date', nullable: true }) effectiveFrom: string;

  @Column({ type: 'date', nullable: true }) effectiveTo: string;

  @Column({ type: 'enum', enum: DisciplineStatus, default: DisciplineStatus.ACTIVE })
  status: DisciplineStatus;

  @Column({ nullable: true, type: 'text' }) resolution: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issued_by_id' })
  issuedBy: User;

  @Column({ name: 'issued_by_id' }) issuedById: string;

  @Column({ default: false }) parentNotified: boolean;

  @Column({ type: 'timestamp', nullable: true }) parentNotifiedAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
