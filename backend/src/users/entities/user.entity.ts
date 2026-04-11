import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';

export enum UserRole {
  HEAD_TEACHER = 'HEAD_TEACHER',
  DEPUTY_HEAD = 'DEPUTY_HEAD',
  HOD = 'HOD',
  EXAMINATIONS_OFFICER = 'EXAMINATIONS_OFFICER',
  TEACHER = 'TEACHER',
  SEN_TEACHER = 'SEN_TEACHER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  PAYROLL_OFFICER = 'PAYROLL_OFFICER',
  HR_OFFICER = 'HR_OFFICER',
  BOARDING_MASTER = 'BOARDING_MASTER',
  HEAD_OF_BOARDING = 'HEAD_OF_BOARDING',
  NURSE = 'NURSE',
  GATE_GUARD = 'GATE_GUARD',
  HEAD_OF_SECURITY = 'HEAD_OF_SECURITY',
  ECA_OFFICER = 'ECA_OFFICER',
  COMMUNICATIONS_OFFICER = 'COMMUNICATIONS_OFFICER',
  UNIFORM_OFFICER = 'UNIFORM_OFFICER',
  FACILITIES_MANAGER = 'FACILITIES_MANAGER',
  SCHOOL_COUNSELOR = 'SCHOOL_COUNSELOR',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('simple-array')
  roles: UserRole[];

  @ManyToOne(() => School, { nullable: true, eager: false })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ nullable: true, name: 'school_id' })
  schoolId: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
