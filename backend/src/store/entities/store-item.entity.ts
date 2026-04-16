import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum StoreCategory { STATIONERY = 'STATIONERY', EQUIPMENT = 'EQUIPMENT', CLEANING = 'CLEANING', SPORTS = 'SPORTS', OTHER = 'OTHER' }

@Entity('store_items')
export class StoreItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column() name: string;
  @Column({ nullable: true }) code: string;
  @Column({ type: 'enum', enum: StoreCategory, default: StoreCategory.OTHER }) category: StoreCategory;
  @Column({ default: 'piece' }) unit: string;
  @Column({ name: 'quantity_in_stock', default: 0 }) quantityInStock: number;
  @Column({ name: 'reorder_level', default: 5 })     reorderLevel: number;
  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true }) unitCost: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
