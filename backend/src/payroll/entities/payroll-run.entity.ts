import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum PayrollRunStatus {
  DRAFT     = 'DRAFT',
  APPROVED  = 'APPROVED',
  PAID      = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('payroll_runs')
export class PayrollRun {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column({ length: 7 }) month: string;             // YYYY-MM
  @Column({ type: 'enum', enum: PayrollRunStatus, default: PayrollRunStatus.DRAFT }) status: PayrollRunStatus;
  @Column({ name: 'total_gross', type: 'numeric', precision: 15, scale: 2, default: 0 }) totalGross: number;
  @Column({ name: 'total_net',   type: 'numeric', precision: 15, scale: 2, default: 0 }) totalNet: number;
  @Column({ name: 'total_paye',  type: 'numeric', precision: 15, scale: 2, default: 0 }) totalPaye: number;
  @Column({ name: 'total_nssf',  type: 'numeric', precision: 15, scale: 2, default: 0 }) totalNssf: number;
  @Column({ name: 'run_by', nullable: true }) runBy: string;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @Column({ name: 'processed_at', nullable: true }) processedAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
