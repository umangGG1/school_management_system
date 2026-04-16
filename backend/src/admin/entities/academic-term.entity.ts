import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum TermStatus {
  UPCOMING = 'upcoming',
  CURRENT = 'current',
  COMPLETED = 'completed',
}

@Entity('academic_terms')
export class AcademicTerm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column()
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ default: 12 })
  weeks: number;

  @Column({ type: 'enum', enum: TermStatus, default: TermStatus.UPCOMING })
  status: TermStatus;

  @Column({ name: 'academic_year', nullable: true })
  academicYear: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
