import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { SchoolClass } from '../../academic/entities/class.entity';

export enum FeeCategory {
  TUITION = 'TUITION',
  BOARDING = 'BOARDING',
  DAY_SCHOLAR = 'DAY_SCHOLAR',
  PTA = 'PTA',
  DEVELOPMENT = 'DEVELOPMENT',
  UNIFORM = 'UNIFORM',
  MEDICAL = 'MEDICAL',
  OTHER = 'OTHER',
}

@Entity('fee_structures')
export class FeeStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' })
  schoolId: string;

  @ManyToOne(() => SchoolClass, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClass;

  @Column({ nullable: true, name: 'class_id' })
  classId: string;

  @Column({ type: 'enum', enum: FeeCategory })
  category: FeeCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  term: string;

  @Column()
  academicYear: string;

  @CreateDateColumn()
  createdAt: Date;
}
