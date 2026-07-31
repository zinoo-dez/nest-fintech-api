import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LedgerDirection } from '../../../common/enums/fintech.enum';
import { Transaction } from './transaction.entity';
import { Account } from '../../accounts/entities/account.entity';

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  transactionId: string;

  @ManyToOne(() => Transaction, (tx) => tx.ledgerEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'varchar' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.ledgerEntries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({
    type: 'simple-enum',
    enum: LedgerDirection,
  })
  direction: LedgerDirection;

  @Column('decimal', {
    precision: 18,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
