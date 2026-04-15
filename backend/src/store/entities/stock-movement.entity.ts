import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum MovementType { IN = 'IN', OUT = 'OUT', ADJUSTMENT = 'ADJUSTMENT' }

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'store_item_id' }) storeItemId: string;
  @Column({ name: 'school_id' })     schoolId: string;
  @Column({ type: 'enum', enum: MovementType }) type: MovementType;
  @Column() quantity: number;
  @Column({ nullable: true }) reason: string;
  @Column({ name: 'performed_by', nullable: true }) performedBy: string;
  @Column({ name: 'requisition_id', nullable: true }) requisitionId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
