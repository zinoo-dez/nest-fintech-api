import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import {
  AccountType,
  LedgerDirection,
  TransactionStatus,
  TransactionType,
} from '../../common/enums/fintech.enum';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Returns lock configuration based on DB driver (Pessimistic Write for PostgreSQL, default for SQLite)
   */
  private getLockMode() {
    const isPostgres = this.dataSource.driver.options.type === 'postgres';
    return isPostgres ? { mode: 'pessimistic_write' as const } : undefined;
  }

  /**
   * Helper to fetch system reserve accounts (Bank Reserve, System Fee Revenue)
   */
  private async getSystemAccount(
    queryRunner: QueryRunner,
    name: string,
    accountType: AccountType,
  ): Promise<Account> {
    const lockOption = this.getLockMode();
    let account = await queryRunner.manager.findOne(Account, {
      where: { name, accountType },
      lock: lockOption,
    });

    if (!account) {
      account = queryRunner.manager.create(Account, {
        name,
        accountType,
        cachedBalance: 0,
      });
      await queryRunner.manager.save(Account, account);
    }

    return account;
  }

  /**
   * Helper to fetch user's payable liability account with Lock
   */
  private async getAccountWithLock(
    queryRunner: QueryRunner,
    walletId: string,
  ): Promise<Account> {
    const lockOption = this.getLockMode();
    const account = await queryRunner.manager.findOne(Account, {
      where: { walletId, accountType: AccountType.LIABILITY },
      lock: lockOption,
    });

    if (!account) {
      throw new NotFoundException(`Account for Wallet ID ${walletId} not found`);
    }

    return account;
  }

  /**
   * Double-Entry Bookkeeping Rule Validator
   * Asserts Sum(Debits) === Sum(Credits)
   */
  private validateDoubleEntryBalance(entries: Array<{ amount: number; direction: LedgerDirection }>) {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      if (entry.direction === LedgerDirection.DEBIT) {
        totalDebit += entry.amount;
      } else if (entry.direction === LedgerDirection.CREDIT) {
        totalCredit += entry.amount;
      }
    }

    if (parseFloat(totalDebit.toFixed(4)) !== parseFloat(totalCredit.toFixed(4))) {
      throw new BadRequestException(
        `Double-entry imbalance detected: Total Debits (${totalDebit}) != Total Credits (${totalCredit})`,
      );
    }
  }

  /**
   * Deposit (Top-up Wallet)
   */
  async deposit(dto: DepositDto, idempotencyKey?: string): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAccount = await this.getAccountWithLock(queryRunner, dto.walletId);
      const bankReserve = await this.getSystemAccount(
        queryRunner,
        'SYSTEM_BANK_RESERVE',
        AccountType.ASSET,
      );

      const entries = [
        { account: bankReserve, direction: LedgerDirection.DEBIT, amount: dto.amount },
        { account: userAccount, direction: LedgerDirection.CREDIT, amount: dto.amount },
      ];

      this.validateDoubleEntryBalance(entries);

      const tx = queryRunner.manager.create(Transaction, {
        idempotencyKey: idempotencyKey || null,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.POSTED,
        totalAmount: dto.amount,
        description: dto.description || 'Wallet Deposit',
      });
      await queryRunner.manager.save(Transaction, tx);

      for (const entry of entries) {
        const ledgerEntry = queryRunner.manager.create(LedgerEntry, {
          transactionId: tx.id,
          accountId: entry.account.id,
          direction: entry.direction,
          amount: entry.amount,
        });
        await queryRunner.manager.save(LedgerEntry, ledgerEntry);

        if (entry.account.accountType === AccountType.ASSET) {
          entry.account.cachedBalance += entry.amount;
        } else if (entry.account.accountType === AccountType.LIABILITY) {
          entry.account.cachedBalance += entry.amount;
        }
        await queryRunner.manager.save(Account, entry.account);
      }

      await queryRunner.commitTransaction();
      return tx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * P2P Wallet Transfer
   */
  async transfer(dto: TransferDto, idempotencyKey?: string): Promise<Transaction> {
    if (dto.senderWalletId === dto.receiverWalletId) {
      throw new BadRequestException('Cannot transfer money to the same wallet');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const walletIds = [dto.senderWalletId, dto.receiverWalletId].sort();
      const firstAccount = await this.getAccountWithLock(queryRunner, walletIds[0]);
      const secondAccount = await this.getAccountWithLock(queryRunner, walletIds[1]);

      const senderAccount =
        firstAccount.walletId === dto.senderWalletId ? firstAccount : secondAccount;
      const receiverAccount =
        firstAccount.walletId === dto.receiverWalletId ? firstAccount : secondAccount;

      if (senderAccount.cachedBalance < dto.amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${senderAccount.cachedBalance}, Required: ${dto.amount}`,
        );
      }

      const entries = [
        { account: senderAccount, direction: LedgerDirection.DEBIT, amount: dto.amount },
        { account: receiverAccount, direction: LedgerDirection.CREDIT, amount: dto.amount },
      ];

      this.validateDoubleEntryBalance(entries);

      const tx = queryRunner.manager.create(Transaction, {
        idempotencyKey: idempotencyKey || null,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.POSTED,
        totalAmount: dto.amount,
        description: dto.description || `P2P Transfer from ${dto.senderWalletId} to ${dto.receiverWalletId}`,
      });
      await queryRunner.manager.save(Transaction, tx);

      for (const entry of entries) {
        const ledger = queryRunner.manager.create(LedgerEntry, {
          transactionId: tx.id,
          accountId: entry.account.id,
          direction: entry.direction,
          amount: entry.amount,
        });
        await queryRunner.manager.save(LedgerEntry, ledger);

        if (entry.direction === LedgerDirection.DEBIT) {
          entry.account.cachedBalance -= entry.amount;
        } else {
          entry.account.cachedBalance += entry.amount;
        }
        await queryRunner.manager.save(Account, entry.account);
      }

      await queryRunner.commitTransaction();
      return tx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Withdrawal with System Fee
   */
  async withdraw(dto: WithdrawDto, idempotencyKey?: string): Promise<Transaction> {
    const feeAmount = dto.feeAmount || 0;
    const totalDeduction = dto.amount + feeAmount;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAccount = await this.getAccountWithLock(queryRunner, dto.walletId);
      const bankReserve = await this.getSystemAccount(
        queryRunner,
        'SYSTEM_BANK_RESERVE',
        AccountType.ASSET,
      );
      const feeRevenue = await this.getSystemAccount(
        queryRunner,
        'SYSTEM_FEE_REVENUE',
        AccountType.REVENUE,
      );

      if (userAccount.cachedBalance < totalDeduction) {
        throw new BadRequestException(
          `Insufficient balance for withdrawal + fee. Required: ${totalDeduction}, Available: ${userAccount.cachedBalance}`,
        );
      }

      const entries = [
        { account: userAccount, direction: LedgerDirection.DEBIT, amount: totalDeduction },
        { account: bankReserve, direction: LedgerDirection.CREDIT, amount: dto.amount },
      ];

      if (feeAmount > 0) {
        entries.push({
          account: feeRevenue,
          direction: LedgerDirection.CREDIT,
          amount: feeAmount,
        });
      }

      this.validateDoubleEntryBalance(entries);

      const tx = queryRunner.manager.create(Transaction, {
        idempotencyKey: idempotencyKey || null,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.POSTED,
        totalAmount: totalDeduction,
        description: dto.description || 'Wallet Withdrawal',
      });
      await queryRunner.manager.save(Transaction, tx);

      for (const entry of entries) {
        const ledger = queryRunner.manager.create(LedgerEntry, {
          transactionId: tx.id,
          accountId: entry.account.id,
          direction: entry.direction,
          amount: entry.amount,
        });
        await queryRunner.manager.save(LedgerEntry, ledger);

        if (entry.account.accountType === AccountType.LIABILITY) {
          entry.account.cachedBalance -= entry.amount;
        } else if (entry.account.accountType === AccountType.ASSET) {
          entry.account.cachedBalance -= entry.amount;
        } else if (entry.account.accountType === AccountType.REVENUE) {
          entry.account.cachedBalance += entry.amount;
        }
        await queryRunner.manager.save(Account, entry.account);
      }

      await queryRunner.commitTransaction();
      return tx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Recalculate and verify balance directly from historical ledger entries
   */
  async calculateBalanceFromLedger(accountId: string): Promise<number> {
    const entries = await this.dataSource.getRepository(LedgerEntry).find({
      where: { accountId },
    });

    let balance = 0;
    for (const entry of entries) {
      if (entry.direction === LedgerDirection.CREDIT) {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    }
    return balance;
  }
}
