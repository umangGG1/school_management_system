import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

export enum AnnouncementCategory {
  ACADEMIC = 'ACADEMIC',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  URGENT = 'URGENT',
  BOARDING = 'BOARDING',
  SAFETY = 'SAFETY',
  GENERAL = 'GENERAL',
}

export enum AnnouncementAudience {
  ALL = 'ALL',
  ALL_STAFF = 'ALL_STAFF',
  ALL_STUDENTS = 'ALL_STUDENTS',
  ALL_PARENTS = 'ALL_PARENTS',
  BOARDING_STAFF = 'BOARDING_STAFF',
  BOARDING_STUDENTS = 'BOARDING_STUDENTS',
  SPECIFIC_CLASS = 'SPECIFIC_CLASS',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: AnnouncementCategory, default: AnnouncementCategory.GENERAL })
  category: AnnouncementCategory;

  @Column({ type: 'enum', enum: AnnouncementAudience, default: AnnouncementAudience.ALL_STAFF })
  targetAudience: AnnouncementAudience;

  @Column({ nullable: true, name: 'target_class_id' })
  targetClassId: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ nullable: true, name: 'created_by_id' })
  createdById: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
