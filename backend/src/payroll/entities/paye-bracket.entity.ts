import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('paye_brackets')
export class PayeBracket {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 2, default: 'UG' }) country: string;
  @Column({ name: 'min_income', type: 'numeric', precision: 15, scale: 2 }) minIncome: number;
  @Column({ name: 'max_income', type: 'numeric', precision: 15, scale: 2, nullable: true }) maxIncome: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 4 }) rate: number;           // e.g. 0.3 = 30%
  @Column({ name: 'fixed_amount', type: 'numeric', precision: 15, scale: 2, default: 0 }) fixedAmount: number;
  @Column({ name: 'effective_from', type: 'date' }) effectiveFrom: string;     // YYYY-MM-DD
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
