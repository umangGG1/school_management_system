import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum AssetCategory { FURNITURE = 'FURNITURE', EQUIPMENT = 'EQUIPMENT', VEHICLE = 'VEHICLE', LAB = 'LAB', OTHER = 'OTHER' }
export enum AssetCondition { NEW = 'NEW', GOOD = 'GOOD', FAIR = 'FAIR', POOR = 'POOR' }

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'enum', enum: AssetCategory, default: AssetCategory.OTHER }) category: AssetCategory;
  @Column({ default: 1 }) quantity: number;
  @Column({ name: 'unit_cost', type: 'numeric', precision: 15, scale: 2, nullable: true }) unitCost: number;
  @Column({ nullable: true }) location: string;
  @Column({ name: 'serial_number', nullable: true }) serialNumber: string;
  @Column({ type: 'enum', enum: AssetCondition, default: AssetCondition.GOOD }) condition: AssetCondition;
  @Column({ name: 'purchased_at', type: 'date', nullable: true }) purchasedAt: string;
  @Column({ name: 'warranty_expiry', type: 'date', nullable: true }) warrantyExpiry: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
