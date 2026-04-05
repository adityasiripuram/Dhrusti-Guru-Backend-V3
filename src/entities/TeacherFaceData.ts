import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './Teacher';

@Entity({ name: 'teacher_face_data' })
export class TeacherFaceData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Teacher;

  @Column({ nullable: true })
  rekognitionFaceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  embedding?: any;

  @Column({ nullable: true })
  captureAngle?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
