import { LedgerDirection } from '../../../common/enums/fintech.enum';
import { Transaction } from './transaction.entity';
import { Account } from '../../accounts/entities/account.entity';
export declare class LedgerEntry {
    id: string;
    transactionId: string;
    transaction: Transaction;
    accountId: string;
    account: Account;
    direction: LedgerDirection;
    amount: number;
    createdAt: Date;
}
