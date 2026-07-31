import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LedgerEntry } from '../transactions/entities/ledger-entry.entity';
import { IdempotencyKey } from '../idempotency/entities/idempotency-key.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
export declare class SeedService {
    private readonly dataSource;
    private readonly userRepo;
    private readonly walletRepo;
    private readonly accountRepo;
    private readonly txRepo;
    private readonly ledgerRepo;
    private readonly idempotencyRepo;
    private readonly auditRepo;
    private readonly logger;
    constructor(dataSource: DataSource, userRepo: Repository<User>, walletRepo: Repository<Wallet>, accountRepo: Repository<Account>, txRepo: Repository<Transaction>, ledgerRepo: Repository<LedgerEntry>, idempotencyRepo: Repository<IdempotencyKey>, auditRepo: Repository<AuditLog>);
    seedAllEntities(): Promise<{
        message: string;
        counts: {
            users: number;
            wallets: number;
            accounts: number;
            transactions: number;
            idempotencyKeys: number;
            auditLogs: number;
        };
        users: User[];
        wallets: Wallet[];
        accounts: Account[];
        transactions: Transaction[];
        idempotencyKeys: IdempotencyKey[];
        auditLogs: AuditLog[];
    }>;
    getDatabaseSummary(): Promise<{
        message: string;
        counts: {
            users: number;
            wallets: number;
            accounts: number;
            transactions: number;
            idempotencyKeys: number;
            auditLogs: number;
        };
        users: User[];
        wallets: Wallet[];
        accounts: Account[];
        transactions: Transaction[];
        idempotencyKeys: IdempotencyKey[];
        auditLogs: AuditLog[];
    }>;
}
