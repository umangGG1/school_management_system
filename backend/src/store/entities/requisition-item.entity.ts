import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('requisition_items')
export class RequisitionItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'requisition_id' })  requisitionId: string;
  @Column({ name: 'store_item_id' })   storeItemId: string;
  @Column({ name: 'quantity_requested' }) quantityRequested: number;
  @Column({ name: 'quantity_issued', default: 0 }) quantityIssued: number;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
