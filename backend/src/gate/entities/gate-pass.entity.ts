import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum GatePassStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', USED = 'USED', EXPIRED = 'EXPIRED', REVOKED = 'REVOKED' }

@Entity('gate_passes')
export class GatePass {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })       schoolId: string;
  @Column({ name: 'student_id' })      studentId: string;
  @Column({ name: 'requested_by' })    requestedBy: string;
  @Column({ name: 'pass_code', length: 6, nullable: true }) passCode: string;
  @Column({ nullable: true, type: 'text' }) reason: string;
  @Column({ name: 'authorized_by', nullable: true }) authorizedBy: string;
  @Column({ name: 'valid_from', nullable: true })  validFrom: Date;
  @Column({ name: 'valid_until', nullable: true }) validUntil: Date;
  @Column({ type: 'enum', enum: GatePassStatus, default: GatePassStatus.PENDING }) status: GatePassStatus;
  @Column({ name: 'used_at', nullable: true }) usedAt: Date;
  @Column({ name: 'returned_at', nullable: true }) returnedAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
