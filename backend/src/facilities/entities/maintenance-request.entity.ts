import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum MaintenancePriority { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum MaintenanceStatus   { OPEN = 'OPEN', IN_PROGRESS = 'IN_PROGRESS', RESOLVED = 'RESOLVED' }

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })           schoolId: string;
  @Column({ name: 'asset_id', nullable: true }) assetId: string;
  @Column({ name: 'reported_by' })         reportedBy: string;
  @Column({ type: 'text' })                description: string;
  @Column({ type: 'enum', enum: MaintenancePriority, default: MaintenancePriority.MEDIUM }) priority: MaintenancePriority;
  @Column({ type: 'enum', enum: MaintenanceStatus,   default: MaintenanceStatus.OPEN     }) status: MaintenanceStatus;
  @Column({ name: 'resolved_by', nullable: true }) resolvedBy: string;
  @Column({ name: 'resolved_at', nullable: true })  resolvedAt: Date;
  @Column({ name: 'resolution_notes', nullable: true, type: 'text' }) resolutionNotes: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
