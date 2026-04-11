import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  motto: string;

  @Column({ nullable: true })
  foundedYear: string;

  @Column({ nullable: true })
  type: string;           // e.g. Government-Aided, Private

  @Column({ nullable: true })
  ownership: string;      // e.g. Anglican (COU)

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  principalName: string;

  @Column({ nullable: true })
  deoName: string;

  @Column({ nullable: true })
  moesId: string;

  @Column({ nullable: true })
  streams: string;        // comma-separated: "Sciences, Arts, Business"

  @Column({ nullable: true, default: 'Uganda' })
  country: string;

  @Column({ nullable: true, default: 'UGX' })
  currency: string;

  // Academic calendar fields (managed by Head Teacher / Admin)
  @Column({ nullable: true })
  currentTerm: string;       // e.g. "Term 1"

  @Column({ nullable: true })
  academicYear: string;      // e.g. "2026"

  @Column({ nullable: true, type: 'int' })
  currentWeek: number;       // e.g. 8

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
