import { DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
export declare class TransactionsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private getLockMode;
    private getSystemAccount;
    private getAccountWithLock;
    private validateDoubleEntryBalance;
    deposit(dto: DepositDto, idempotencyKey?: string): Promise<Transaction>;
    transfer(dto: TransferDto, idempotencyKey?: string): Promise<Transaction>;
    withdraw(dto: WithdrawDto, idempotencyKey?: string): Promise<Transaction>;
    calculateBalanceFromLedger(accountId: string): Promise<number>;
}
