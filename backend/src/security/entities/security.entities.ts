import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

// ─── Gate Log ─────────────────────────────────────────────────────────────────
export enum GatePersonType {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
  VISITOR = 'VISITOR',
  SUPPLIER = 'SUPPLIER',
  VEHICLE = 'VEHICLE',
}

@Entity('gate_logs')
export class GateLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;

  @Column() personName: string;
  @Column({ type: 'enum', enum: GatePersonType, default: GatePersonType.VISITOR }) personType: GatePersonType;
  @Column({ nullable: true }) studentId: string;
  @Column({ nullable: true }) staffId: string;
  @Column({ nullable: true, type: 'text' }) purpose: string;
  @Column({ nullable: true }) destination: string;
  @Column({ default: 1 }) gateNumber: number;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) checkInTime: Date;
  @Column({ type: 'timestamp', nullable: true }) checkOutTime: Date;
  @Column({ nullable: true }) badgeNumber: string;
  @Column({ nullable: true }) vehicleReg: string;
  @Column({ nullable: true, type: 'text' }) notes: string;

  @Column({ name: 'guard_id', nullable: true }) guardId: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'guard_id' }) guard: User;

  @CreateDateColumn() createdAt: Date;
}

// ─── Security Incident ────────────────────────────────────────────────────────
export enum IncidentSeverity { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum IncidentStatus { OPEN = 'OPEN', IN_PROGRESS = 'IN_PROGRESS', RESOLVED = 'RESOLVED' }

@Entity('security_incidents')
export class SecurityIncident {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'school_id' }) schoolId: string;
  @ManyToOne(() => School, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'school_id' }) school: School;

  @Column() title: string;
  @Column('text') description: string;
  @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.MEDIUM }) severity: IncidentSeverity;
  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN }) status: IncidentStatus;

  @Column({ name: 'reported_by_id', nullable: true }) reportedById: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'reported_by_id' }) reportedBy: User;

  @Column({ name: 'assigned_to_id', nullable: true }) assignedToId: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'assigned_to_id' }) assignedTo: User;

  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @Column({ nullable: true, type: 'text' }) resolutionNotes: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
