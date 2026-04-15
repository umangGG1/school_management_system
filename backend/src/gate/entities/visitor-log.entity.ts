import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })          schoolId: string;
  @Column({ name: 'visitor_name' })        visitorName: string;
  @Column({ name: 'visitor_phone', nullable: true }) visitorPhone: string;
  @Column({ name: 'national_id', nullable: true })   nationalId: string;
  @Column({ name: 'host_name', nullable: true })     hostName: string;
  @Column({ name: 'host_dept', nullable: true })     hostDept: string;
  @Column({ nullable: true })                        purpose: string;
  @Column({ name: 'vehicle_reg', nullable: true })   vehicleReg: string;
  @Column({ name: 'entry_time', nullable: true })    entryTime: Date;
  @Column({ name: 'exit_time', nullable: true })     exitTime: Date;
  @Column({ name: 'badge_number', nullable: true })  badgeNumber: string;
  @Column({ name: 'registered_by', nullable: true }) registeredBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
