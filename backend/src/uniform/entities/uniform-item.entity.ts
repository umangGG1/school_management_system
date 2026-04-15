import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum UniformGender { MALE = 'MALE', FEMALE = 'FEMALE', UNISEX = 'UNISEX' }

@Entity('uniform_items')
export class UniformItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' }) schoolId: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: UniformGender, default: UniformGender.UNISEX }) gender: UniformGender;
  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 }) unitPrice: number;
  @Column({ nullable: true }) supplier: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
