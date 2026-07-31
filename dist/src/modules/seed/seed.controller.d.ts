import { SeedService } from './seed.service';
export declare class SeedController {
    private readonly seedService;
    constructor(seedService: SeedService);
    runSeed(): Promise<{
        message: string;
        counts: {
            users: number;
            wallets: number;
            accounts: number;
            transactions: number;
            idempotencyKeys: number;
            auditLogs: number;
        };
        users: import("../users/entities/user.entity").User[];
        wallets: import("../wallets/entities/wallet.entity").Wallet[];
        accounts: import("../accounts/entities/account.entity").Account[];
        transactions: import("../transactions/entities/transaction.entity").Transaction[];
        idempotencyKeys: import("../idempotency/entities/idempotency-key.entity").IdempotencyKey[];
        auditLogs: import("../audit/entities/audit-log.entity").AuditLog[];
    }>;
    getSummary(): Promise<{
        message: string;
        counts: {
            users: number;
            wallets: number;
            accounts: number;
            transactions: number;
            idempotencyKeys: number;
            auditLogs: number;
        };
        users: import("../users/entities/user.entity").User[];
        wallets: import("../wallets/entities/wallet.entity").Wallet[];
        accounts: import("../accounts/entities/account.entity").Account[];
        transactions: import("../transactions/entities/transaction.entity").Transaction[];
        idempotencyKeys: import("../idempotency/entities/idempotency-key.entity").IdempotencyKey[];
        auditLogs: import("../audit/entities/audit-log.entity").AuditLog[];
    }>;
}
