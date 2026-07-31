import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { IdempotencyModule } from '../idempotency/idempotency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, LedgerEntry]),
    IdempotencyModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
