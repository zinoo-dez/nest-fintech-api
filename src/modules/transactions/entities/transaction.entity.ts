import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TransactionType, TransactionStatus } from '../../../common/enums/fintech.enum';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  idempotencyKey: string | null;

  @Column({
    type: 'simple-enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'simple-enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column('decimal', {
    precision: 18,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => LedgerEntry, (entry) => entry.transaction, { cascade: true })
  ledgerEntries: LedgerEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
