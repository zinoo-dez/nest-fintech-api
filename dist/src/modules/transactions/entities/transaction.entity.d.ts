import { TransactionType, TransactionStatus } from '../../../common/enums/fintech.enum';
import { LedgerEntry } from './ledger-entry.entity';
export declare class Transaction {
    id: string;
    idempotencyKey: string | null;
    type: TransactionType;
    status: TransactionStatus;
    totalAmount: number;
    description: string;
    metadata: Record<string, any>;
    ledgerEntries: LedgerEntry[];
    createdAt: Date;
    updatedAt: Date;
}
