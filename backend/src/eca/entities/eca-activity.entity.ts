import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('eca_activities')
export class EcaActivity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })                    schoolId: string;
  @Column()                                          name: string;
  @Column({ nullable: true })                        icon: string;
  @Column({ default: 'CLUB' })                       category: string; // SPORTS | CLUB | ARTS | FAITH | LEADERSHIP | COMMUNITY
  @Column({ name: 'patron_id', nullable: true })     patronId: string;
  @Column({ name: 'patron_name', nullable: true })   patronName: string;
  @Column({ name: 'meeting_day', nullable: true })   meetingDay: string;
  @Column({ nullable: true })                        venue: string;
  @Column({ name: 'is_active', default: true })      isActive: boolean;
  @Column({ name: 'member_count', default: 0 })      memberCount: number;
  @CreateDateColumn({ name: 'created_at' })          createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })          updatedAt: Date;
}
