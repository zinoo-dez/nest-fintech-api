import { Wallet } from '../../wallets/entities/wallet.entity';
import { AccountType } from '../../../common/enums/fintech.enum';
import { LedgerEntry } from '../../transactions/entities/ledger-entry.entity';
export declare class Account {
    id: string;
    walletId: string | null;
    wallet: Wallet | null;
    name: string;
    accountType: AccountType;
    cachedBalance: number;
    version: number;
    ledgerEntries: LedgerEntry[];
    createdAt: Date;
    updatedAt: Date;
}
