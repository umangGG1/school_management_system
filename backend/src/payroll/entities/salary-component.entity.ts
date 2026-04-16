import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum ComponentType {
  BASE      = 'BASE',
  HOUSING   = 'HOUSING',
  TRANSPORT = 'TRANSPORT',
  MEDICAL   = 'MEDICAL',
  SACCO     = 'SACCO',
  OTHER     = 'OTHER',
}

@Entity('salary_components')
export class SalaryComponent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'staff_member_id' }) staffMemberId: string;
  @Column({ name: 'school_id' })       schoolId: string;
  @Column({ type: 'enum', enum: ComponentType }) componentType: ComponentType;
  @Column({ type: 'numeric', precision: 15, scale: 2 }) amount: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
