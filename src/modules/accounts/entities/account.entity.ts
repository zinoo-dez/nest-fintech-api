import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { AccountType } from '../../../common/enums/fintech.enum';
import { LedgerEntry } from '../../transactions/entities/ledger-entry.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  walletId: string | null;

  @ManyToOne(() => Wallet, (wallet) => wallet.accounts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'simple-enum',
    enum: AccountType,
    default: AccountType.LIABILITY,
  })
  accountType: AccountType;

  @Column('decimal', {
    precision: 18,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  cachedBalance: number;

  @VersionColumn()
  version: number;

  @OneToMany(() => LedgerEntry, (entry) => entry.account)
  ledgerEntries: LedgerEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
