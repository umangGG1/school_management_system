import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum UniformSize { XS = 'XS', S = 'S', M = 'M', L = 'L', XL = 'XL', XXL = 'XXL', XXXL = 'XXXL' }

@Entity('uniform_stock')
export class UniformStock {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'uniform_item_id' }) uniformItemId: string;
  @Column({ name: 'school_id' })       schoolId: string;
  @Column({ type: 'enum', enum: UniformSize }) size: UniformSize;
  @Column({ name: 'quantity_in_stock', default: 0 }) quantityInStock: number;
  @Column({ name: 'reorder_level', default: 5 })      reorderLevel: number;
  @Column({ name: 'last_updated', nullable: true })    lastUpdated: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
