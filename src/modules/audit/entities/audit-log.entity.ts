import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar' })
  resource: string;

  @Column('simple-json', { nullable: true })
  payload: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
