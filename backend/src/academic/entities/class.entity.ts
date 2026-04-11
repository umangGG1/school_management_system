import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity('school_classes')
export class SchoolClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. S1, S2, S3, S4, S5, S6 */
  @Column()
  name: string;

  /** e.g. East, West, Arts, Science */
  @Column({ nullable: true })
  stream: string;

  @Column()
  academicYear: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
