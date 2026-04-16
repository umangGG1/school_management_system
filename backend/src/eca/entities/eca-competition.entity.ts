import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('eca_competitions')
export class EcaCompetition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })                              schoolId: string;
  @Column({ name: 'activity_id', nullable: true })            activityId: string;
  @Column({ name: 'activity_name' })                          activityName: string;
  @Column({ name: 'event_name' })                             eventName: string;
  @Column({ name: 'event_date', type: 'date', nullable: true }) eventDate: string;
  @Column({ nullable: true })                                 opponent: string;
  @Column({ name: 'is_home', default: true })                 isHome: boolean;
  @Column({ nullable: true })                                 venue: string;
  @Column({ nullable: true })                                 result: string; // WIN | LOSS | DRAW | null
  @Column({ nullable: true })                                 score: string;
  @Column({ name: 'man_of_match', nullable: true })           manOfMatch: string;
  @Column({ default: 'UPCOMING' })                            status: string; // UPCOMING | COMPLETED | CANCELLED
  @Column({ name: 'entry_fee', type: 'int', default: 0 })     entryFee: number;
  @Column({ name: 'transport_arranged', default: false })     transportArranged: boolean;
  @Column({ type: 'text', nullable: true })                   notes: string;
  @CreateDateColumn({ name: 'created_at' })                   createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })                   updatedAt: Date;
}
