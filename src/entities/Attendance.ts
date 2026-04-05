import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './Teacher';

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Late = 'Late',
  Left = 'Left'
}

@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Teacher;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'timestamptz', nullable: true })
  checkInTime?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutTime?: Date;

  @Column({ type: 'float', nullable: true })
  totalHours?: number;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.Present })
  status!: AttendanceStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
