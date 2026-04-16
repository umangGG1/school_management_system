import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethod { BANK = 'BANK', MOBILE_MONEY = 'MOBILE_MONEY', CASH = 'CASH' }

@Entity('payslips')
export class Payslip {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'payroll_run_id' })       payrollRunId: string;
  @Column({ name: 'staff_member_id' })      staffMemberId: string;
  @Column({ name: 'school_id' })            schoolId: string;
  @Column({ name: 'gross_salary',      type: 'numeric', precision: 15, scale: 2 }) grossSalary: number;
  @Column({ name: 'paye_deduction',    type: 'numeric', precision: 15, scale: 2, default: 0 }) payeDeduction: number;
  @Column({ name: 'nssf_employee',     type: 'numeric', precision: 15, scale: 2, default: 0 }) nssfEmployee: number;
  @Column({ name: 'nssf_employer',     type: 'numeric', precision: 15, scale: 2, default: 0 }) nssfEmployer: number;
  @Column({ name: 'sacco_deduction',   type: 'numeric', precision: 15, scale: 2, default: 0 }) saccoDeduction: number;
  @Column({ name: 'other_deductions',  type: 'numeric', precision: 15, scale: 2, default: 0 }) otherDeductions: number;
  @Column({ name: 'net_pay',           type: 'numeric', precision: 15, scale: 2 }) netPay: number;
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK }) paymentMethod: PaymentMethod;
  @Column({ name: 'payment_ref', nullable: true }) paymentRef: string;
  @Column({ name: 'pdf_url',     nullable: true }) pdfUrl: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
