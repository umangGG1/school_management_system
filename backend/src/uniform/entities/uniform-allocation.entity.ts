import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';
import { UniformSize } from './uniform-stock.entity';

export enum AllocationCondition { NEW = 'NEW', GOOD = 'GOOD', WORN = 'WORN' }

@Entity('uniform_allocations')
export class UniformAllocation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'student_id' })      studentId: string;
  @Column({ name: 'school_id' })       schoolId: string;
  @Column({ name: 'uniform_item_id' }) uniformItemId: string;
  @Column({ name: 'uniform_stock_id' }) uniformStockId: string;
  @Column({ type: 'enum', enum: UniformSize }) size: UniformSize;
  @Column({ default: 1 })              quantity: number;
  @Column({ name: 'issued_at', type: 'timestamp', default: () => 'NOW()' }) issuedAt: Date;
  @Column({ name: 'issued_by' })       issuedBy: string;
  @Column({ name: 'returned_at', nullable: true }) returnedAt: Date;
  @Column({ type: 'enum', enum: AllocationCondition, nullable: true }) condition: AllocationCondition;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
