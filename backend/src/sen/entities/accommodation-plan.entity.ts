import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum PlanStatus { ACTIVE = 'ACTIVE', EXPIRED = 'EXPIRED', CANCELLED = 'CANCELLED' }

@Entity('accommodation_plans')
export class AccommodationPlan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'sen_record_id' }) senRecordId: string;
  @Column({ name: 'student_id' })    studentId: string;
  @Column({ name: 'school_id' })     schoolId: string;
  @Column({ name: 'created_by' })    createdBy: string;
  @Column({ type: 'text' })          plan: string;
  @Column({ name: 'review_date', type: 'date', nullable: true }) reviewDate: string;
  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.ACTIVE }) status: PlanStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
