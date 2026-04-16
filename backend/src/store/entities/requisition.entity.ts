import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum RequisitionStatus {
  PENDING              = 'PENDING',
  APPROVED             = 'APPROVED',
  PARTIALLY_FULFILLED  = 'PARTIALLY_FULFILLED',
  FULFILLED            = 'FULFILLED',
  REJECTED             = 'REJECTED',
}

@Entity('requisitions')
export class Requisition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })     schoolId: string;
  @Column({ name: 'requested_by' })  requestedBy: string;
  @Column({ nullable: true })        department: string;
  @Column({ type: 'enum', enum: RequisitionStatus, default: RequisitionStatus.PENDING }) status: RequisitionStatus;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @Column({ name: 'reviewed_by', nullable: true })   reviewedBy: string;
  @Column({ name: 'reviewed_at', nullable: true })   reviewedAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
