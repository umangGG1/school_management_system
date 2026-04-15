import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('sen_observations')
export class SenObservation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'sen_record_id' })  senRecordId: string;
  @Column({ name: 'student_id' })     studentId: string;
  @Column({ name: 'school_id' })      schoolId: string;
  @Column({ name: 'observed_by' })    observedBy: string;
  @Column({ name: 'observation_date', type: 'date' }) observationDate: string;
  @Column({ type: 'text' })           notes: string;
  @Column({ name: 'academic_impact', nullable: true, type: 'text' })  academicImpact: string;
  @Column({ name: 'behaviour_notes', nullable: true, type: 'text' })  behaviourNotes: string;
  @Column({ nullable: true, type: 'text' })                           recommendations: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
