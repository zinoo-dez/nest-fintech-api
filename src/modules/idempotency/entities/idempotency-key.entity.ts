import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IdempotencyStatus } from '../../../common/enums/fintech.enum';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  requestHash: string;

  @Column({
    type: 'simple-enum',
    enum: IdempotencyStatus,
    default: IdempotencyStatus.STARTED,
  })
  status: IdempotencyStatus;

  @Column('simple-json', { nullable: true })
  responseBody: Record<string, any> | null;

  @Column({ type: 'integer', nullable: true })
  statusCode: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
