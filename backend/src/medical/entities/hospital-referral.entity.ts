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
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum ReferralStatus {
  PENDING = 'PENDING',
  REFERRED = 'REFERRED',
  RETURNED = 'RETURNED',
  ADMITTED = 'ADMITTED',
  COMPLETED = 'COMPLETED',
}

@Entity('hospital_referrals')
export class HospitalReferral {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' }) studentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referred_by_id' })
  referredBy: User;

  @Column({ name: 'referred_by_id', nullable: true }) referredById: string;

  @Column() hospital: string;

  @Column('text') reason: string;

  @Column('text') condition: string;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Column({ type: 'timestamp', nullable: true }) referredAt: Date;

  @Column({ type: 'timestamp', nullable: true }) returnedAt: Date;

  @Column({ nullable: true, type: 'text' }) hospitalNotes: string;

  @Column({ nullable: true, type: 'text' }) followUpPlan: string;

  @Column({ default: false }) parentNotified: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
