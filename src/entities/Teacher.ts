import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './Branch';

@Entity({ name: 'teachers' })
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  department?: string;

  @ManyToOne(() => Branch, { eager: true })
  branch!: Branch;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
