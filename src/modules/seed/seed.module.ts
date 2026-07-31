import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LedgerEntry } from '../transactions/entities/ledger-entry.entity';
import { IdempotencyKey } from '../idempotency/entities/idempotency-key.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Account,
      Transaction,
      LedgerEntry,
      IdempotencyKey,
      AuditLog,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
