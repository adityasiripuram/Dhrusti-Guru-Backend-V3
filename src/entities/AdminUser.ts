import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './Branch';
import { Role } from './Role';

@Entity({ name: 'admin_users' })
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => Branch, { eager: true })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
