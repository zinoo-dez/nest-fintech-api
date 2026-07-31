import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    deposit(dto: DepositDto, idempotencyKey?: string): Promise<import("./entities/transaction.entity").Transaction>;
    transfer(dto: TransferDto, idempotencyKey?: string): Promise<import("./entities/transaction.entity").Transaction>;
    withdraw(dto: WithdrawDto, idempotencyKey?: string): Promise<import("./entities/transaction.entity").Transaction>;
    verifyBalance(accountId: string): Promise<{
        accountId: string;
        ledgerComputedBalance: number;
        isBalanced: boolean;
    }>;
}
