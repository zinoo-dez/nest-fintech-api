"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const account_entity_1 = require("../accounts/entities/account.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const ledger_entry_entity_1 = require("./entities/ledger-entry.entity");
const fintech_enum_1 = require("../../common/enums/fintech.enum");
let TransactionsService = class TransactionsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    getLockMode() {
        const isPostgres = this.dataSource.driver.options.type === 'postgres';
        return isPostgres ? { mode: 'pessimistic_write' } : undefined;
    }
    async getSystemAccount(queryRunner, name, accountType) {
        const lockOption = this.getLockMode();
        let account = await queryRunner.manager.findOne(account_entity_1.Account, {
            where: { name, accountType },
            lock: lockOption,
        });
        if (!account) {
            account = queryRunner.manager.create(account_entity_1.Account, {
                name,
                accountType,
                cachedBalance: 0,
            });
            await queryRunner.manager.save(account_entity_1.Account, account);
        }
        return account;
    }
    async getAccountWithLock(queryRunner, walletId) {
        const lockOption = this.getLockMode();
        const account = await queryRunner.manager.findOne(account_entity_1.Account, {
            where: { walletId, accountType: fintech_enum_1.AccountType.LIABILITY },
            lock: lockOption,
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account for Wallet ID ${walletId} not found`);
        }
        return account;
    }
    validateDoubleEntryBalance(entries) {
        let totalDebit = 0;
        let totalCredit = 0;
        for (const entry of entries) {
            if (entry.direction === fintech_enum_1.LedgerDirection.DEBIT) {
                totalDebit += entry.amount;
            }
            else if (entry.direction === fintech_enum_1.LedgerDirection.CREDIT) {
                totalCredit += entry.amount;
            }
        }
        if (parseFloat(totalDebit.toFixed(4)) !== parseFloat(totalCredit.toFixed(4))) {
            throw new common_1.BadRequestException(`Double-entry imbalance detected: Total Debits (${totalDebit}) != Total Credits (${totalCredit})`);
        }
    }
    async deposit(dto, idempotencyKey) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userAccount = await this.getAccountWithLock(queryRunner, dto.walletId);
            const bankReserve = await this.getSystemAccount(queryRunner, 'SYSTEM_BANK_RESERVE', fintech_enum_1.AccountType.ASSET);
            const entries = [
                { account: bankReserve, direction: fintech_enum_1.LedgerDirection.DEBIT, amount: dto.amount },
                { account: userAccount, direction: fintech_enum_1.LedgerDirection.CREDIT, amount: dto.amount },
            ];
            this.validateDoubleEntryBalance(entries);
            const tx = queryRunner.manager.create(transaction_entity_1.Transaction, {
                idempotencyKey: idempotencyKey || null,
                type: fintech_enum_1.TransactionType.DEPOSIT,
                status: fintech_enum_1.TransactionStatus.POSTED,
                totalAmount: dto.amount,
                description: dto.description || 'Wallet Deposit',
            });
            await queryRunner.manager.save(transaction_entity_1.Transaction, tx);
            for (const entry of entries) {
                const ledgerEntry = queryRunner.manager.create(ledger_entry_entity_1.LedgerEntry, {
                    transactionId: tx.id,
                    accountId: entry.account.id,
                    direction: entry.direction,
                    amount: entry.amount,
                });
                await queryRunner.manager.save(ledger_entry_entity_1.LedgerEntry, ledgerEntry);
                if (entry.account.accountType === fintech_enum_1.AccountType.ASSET) {
                    entry.account.cachedBalance += entry.amount;
                }
                else if (entry.account.accountType === fintech_enum_1.AccountType.LIABILITY) {
                    entry.account.cachedBalance += entry.amount;
                }
                await queryRunner.manager.save(account_entity_1.Account, entry.account);
            }
            await queryRunner.commitTransaction();
            return tx;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async transfer(dto, idempotencyKey) {
        if (dto.senderWalletId === dto.receiverWalletId) {
            throw new common_1.BadRequestException('Cannot transfer money to the same wallet');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const walletIds = [dto.senderWalletId, dto.receiverWalletId].sort();
            const firstAccount = await this.getAccountWithLock(queryRunner, walletIds[0]);
            const secondAccount = await this.getAccountWithLock(queryRunner, walletIds[1]);
            const senderAccount = firstAccount.walletId === dto.senderWalletId ? firstAccount : secondAccount;
            const receiverAccount = firstAccount.walletId === dto.receiverWalletId ? firstAccount : secondAccount;
            if (senderAccount.cachedBalance < dto.amount) {
                throw new common_1.BadRequestException(`Insufficient balance. Available: ${senderAccount.cachedBalance}, Required: ${dto.amount}`);
            }
            const entries = [
                { account: senderAccount, direction: fintech_enum_1.LedgerDirection.DEBIT, amount: dto.amount },
                { account: receiverAccount, direction: fintech_enum_1.LedgerDirection.CREDIT, amount: dto.amount },
            ];
            this.validateDoubleEntryBalance(entries);
            const tx = queryRunner.manager.create(transaction_entity_1.Transaction, {
                idempotencyKey: idempotencyKey || null,
                type: fintech_enum_1.TransactionType.TRANSFER,
                status: fintech_enum_1.TransactionStatus.POSTED,
                totalAmount: dto.amount,
                description: dto.description || `P2P Transfer from ${dto.senderWalletId} to ${dto.receiverWalletId}`,
            });
            await queryRunner.manager.save(transaction_entity_1.Transaction, tx);
            for (const entry of entries) {
                const ledger = queryRunner.manager.create(ledger_entry_entity_1.LedgerEntry, {
                    transactionId: tx.id,
                    accountId: entry.account.id,
                    direction: entry.direction,
                    amount: entry.amount,
                });
                await queryRunner.manager.save(ledger_entry_entity_1.LedgerEntry, ledger);
                if (entry.direction === fintech_enum_1.LedgerDirection.DEBIT) {
                    entry.account.cachedBalance -= entry.amount;
                }
                else {
                    entry.account.cachedBalance += entry.amount;
                }
                await queryRunner.manager.save(account_entity_1.Account, entry.account);
            }
            await queryRunner.commitTransaction();
            return tx;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async withdraw(dto, idempotencyKey) {
        const feeAmount = dto.feeAmount || 0;
        const totalDeduction = dto.amount + feeAmount;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userAccount = await this.getAccountWithLock(queryRunner, dto.walletId);
            const bankReserve = await this.getSystemAccount(queryRunner, 'SYSTEM_BANK_RESERVE', fintech_enum_1.AccountType.ASSET);
            const feeRevenue = await this.getSystemAccount(queryRunner, 'SYSTEM_FEE_REVENUE', fintech_enum_1.AccountType.REVENUE);
            if (userAccount.cachedBalance < totalDeduction) {
                throw new common_1.BadRequestException(`Insufficient balance for withdrawal + fee. Required: ${totalDeduction}, Available: ${userAccount.cachedBalance}`);
            }
            const entries = [
                { account: userAccount, direction: fintech_enum_1.LedgerDirection.DEBIT, amount: totalDeduction },
                { account: bankReserve, direction: fintech_enum_1.LedgerDirection.CREDIT, amount: dto.amount },
            ];
            if (feeAmount > 0) {
                entries.push({
                    account: feeRevenue,
                    direction: fintech_enum_1.LedgerDirection.CREDIT,
                    amount: feeAmount,
                });
            }
            this.validateDoubleEntryBalance(entries);
            const tx = queryRunner.manager.create(transaction_entity_1.Transaction, {
                idempotencyKey: idempotencyKey || null,
                type: fintech_enum_1.TransactionType.WITHDRAWAL,
                status: fintech_enum_1.TransactionStatus.POSTED,
                totalAmount: totalDeduction,
                description: dto.description || 'Wallet Withdrawal',
            });
            await queryRunner.manager.save(transaction_entity_1.Transaction, tx);
            for (const entry of entries) {
                const ledger = queryRunner.manager.create(ledger_entry_entity_1.LedgerEntry, {
                    transactionId: tx.id,
                    accountId: entry.account.id,
                    direction: entry.direction,
                    amount: entry.amount,
                });
                await queryRunner.manager.save(ledger_entry_entity_1.LedgerEntry, ledger);
                if (entry.account.accountType === fintech_enum_1.AccountType.LIABILITY) {
                    entry.account.cachedBalance -= entry.amount;
                }
                else if (entry.account.accountType === fintech_enum_1.AccountType.ASSET) {
                    entry.account.cachedBalance -= entry.amount;
                }
                else if (entry.account.accountType === fintech_enum_1.AccountType.REVENUE) {
                    entry.account.cachedBalance += entry.amount;
                }
                await queryRunner.manager.save(account_entity_1.Account, entry.account);
            }
            await queryRunner.commitTransaction();
            return tx;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async calculateBalanceFromLedger(accountId) {
        const entries = await this.dataSource.getRepository(ledger_entry_entity_1.LedgerEntry).find({
            where: { accountId },
        });
        let balance = 0;
        for (const entry of entries) {
            if (entry.direction === fintech_enum_1.LedgerDirection.CREDIT) {
                balance += entry.amount;
            }
            else {
                balance -= entry.amount;
            }
        }
        return balance;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map