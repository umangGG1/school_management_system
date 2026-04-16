import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', CANCELLED = 'CANCELLED' }

@Entity('facility_bookings')
export class FacilityBooking {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'school_id' })      schoolId: string;
  @Column({ name: 'facility_name' })  facilityName: string;
  @Column({ name: 'booked_by' })      bookedBy: string;
  @Column({ name: 'booking_date', type: 'date' }) bookingDate: string;
  @Column({ name: 'start_time' })     startTime: string;   // HH:MM
  @Column({ name: 'end_time' })       endTime: string;
  @Column({ nullable: true })         purpose: string;
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING }) status: BookingStatus;
  @Column({ name: 'approved_by', nullable: true }) approvedBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
