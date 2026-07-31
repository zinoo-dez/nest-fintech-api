import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { Wallet } from './modules/wallets/entities/wallet.entity';
import { Account } from './modules/accounts/entities/account.entity';
import { Transaction } from './modules/transactions/entities/transaction.entity';
import { LedgerEntry } from './modules/transactions/entities/ledger-entry.entity';
import { IdempotencyKey } from './modules/idempotency/entities/idempotency-key.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { AuditModule } from './modules/audit/audit.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbType = configService.get<string>('DB_TYPE', 'sqlite');

        if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
          return {
            type: 'better-sqlite3',
            database: 'fintech_local.sqlite',
            entities: [
              User,
              Wallet,
              Account,
              Transaction,
              LedgerEntry,
              IdempotencyKey,
              AuditLog,
            ],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'fintech_user'),
          password: configService.get<string>('DB_PASSWORD', 'fintech_secret'),
          database: configService.get<string>('DB_DATABASE', 'fintech_db'),
          entities: [
            User,
            Wallet,
            Account,
            Transaction,
            LedgerEntry,
            IdempotencyKey,
            AuditLog,
          ],
          synchronize: true,
          extra: {
            max: 20,
          },
        };
      },
    }),
    WalletsModule,
    TransactionsModule,
    IdempotencyModule,
    AuditModule,
    SeedModule,
  ],
})
export class AppModule {}
