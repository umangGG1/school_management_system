import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum IntegrationProvider {
  SMS = 'sms',
  EMAIL = 'email',
  PAYMENTS = 'payments',
  BACKUP = 'backup',
  MOES = 'moes',
  UCA = 'uca',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  PENDING = 'pending',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

@Entity('integration_configs')
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column({ type: 'enum', enum: IntegrationProvider })
  provider: IntegrationProvider;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.DISCONNECTED })
  status: IntegrationStatus;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;

  // Stores provider-specific config (API keys, endpoints, etc.)
  // Encrypt sensitive fields at the application layer before storing.
  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ name: 'icon', nullable: true })
  icon: string;

  @Column({ name: 'last_tested_at', type: 'timestamp', nullable: true })
  lastTestedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
