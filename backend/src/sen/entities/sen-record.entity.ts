import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum SenCategory {
  LEARNING_DISABILITY = 'LEARNING_DISABILITY',
  PHYSICAL            = 'PHYSICAL',
  VISUAL              = 'VISUAL',
  HEARING             = 'HEARING',
  SPEECH              = 'SPEECH',
  BEHAVIOURAL         = 'BEHAVIOURAL',
  OTHER               = 'OTHER',
}
export enum SenRecordStatus { ACTIVE = 'ACTIVE', CLOSED = 'CLOSED' }

@Entity('sen_records')
export class SenRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'student_id' })    studentId: string;
  @Column({ name: 'school_id' })     schoolId: string;
  @Column({ type: 'enum', enum: SenCategory }) category: SenCategory;
  @Column({ name: 'identified_at', type: 'date' }) identifiedAt: string;
  @Column({ name: 'identified_by', nullable: true }) identifiedBy: string;
  @Column({ type: 'enum', enum: SenRecordStatus, default: SenRecordStatus.ACTIVE }) status: SenRecordStatus;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
