import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

export enum StaffActionType {
  WARNING = 'WARNING',
  VERBAL_WARNING = 'VERBAL_WARNING',
  SUSPENSION = 'SUSPENSION',
  COMMENDATION = 'COMMENDATION',
  PROMOTION = 'PROMOTION',
  DEMOTION = 'DEMOTION',
  DISMISSAL = 'DISMISSAL',
  QUERY = 'QUERY',
}

@Entity('staff_actions')
export class StaffAction {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' }) schoolId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column({ name: 'staff_id' }) staffId: string;

  @Column({ type: 'enum', enum: StaffActionType }) actionType: StaffActionType;

  @Column('text') reason: string;

  @Column({ nullable: true, type: 'text' }) notes: string;

  @Column({ type: 'date', nullable: true }) effectiveDate: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issued_by_id' })
  issuedBy: User;

  @Column({ name: 'issued_by_id' }) issuedById: string;

  @CreateDateColumn() createdAt: Date;
}
