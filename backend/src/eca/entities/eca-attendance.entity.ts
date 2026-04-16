import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('eca_attendance')
export class EcaAttendanceRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })                       schoolId: string;
  @Column({ name: 'activity_id' })                     activityId: string;
  @Column({ name: 'student_id' })                      studentId: string;
  @Column({ name: 'session_date', type: 'date' })      sessionDate: string;
  @Column({ default: 'PRESENT' })                      status: string; // PRESENT | ABSENT | LATE | EXCUSED
  @Column({ nullable: true, type: 'text' })            notes: string;
  @CreateDateColumn({ name: 'created_at' })            createdAt: Date;
}
