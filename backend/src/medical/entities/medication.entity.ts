import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { SickBayVisit } from './medical.entities';
import { User } from '../../users/entities/user.entity';

@Entity('medication_logs')
export class MedicationLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id', nullable: true }) studentId: string;

  @ManyToOne(() => SickBayVisit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'visit_id' })
  visit: SickBayVisit;

  @Column({ name: 'visit_id', nullable: true }) visitId: string;

  @Column() medicationName: string;

  @Column() dosage: string;

  @Column() frequency: string;

  @Column({ type: 'date', nullable: true }) startDate: string;

  @Column({ type: 'date', nullable: true }) endDate: string;

  @Column({ nullable: true, type: 'text' }) notes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'administered_by_id' })
  administeredBy: User;

  @Column({ name: 'administered_by_id', nullable: true }) administeredById: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) administeredAt: Date;

  @CreateDateColumn() createdAt: Date;
}
