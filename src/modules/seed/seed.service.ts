import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LedgerEntry } from '../transactions/entities/ledger-entry.entity';
import { IdempotencyKey } from '../idempotency/entities/idempotency-key.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import {
  AccountType,
  IdempotencyStatus,
  LedgerDirection,
  TransactionStatus,
  TransactionType,
} from '../../common/enums/fintech.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(LedgerEntry) private readonly ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(IdempotencyKey) private readonly idempotencyRepo: Repository<IdempotencyKey>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Complete Seed Database Engine
   */
  async seedAllEntities() {
    try {
      this.logger.log('🌱 Clearing existing database tables for fresh seeding...');

      // Clear existing records cleanly using repo.clear()
      await this.ledgerRepo.clear();
      await this.txRepo.clear();
      await this.idempotencyRepo.clear();
      await this.auditRepo.clear();
      await this.accountRepo.clear();
      await this.walletRepo.clear();
      await this.userRepo.clear();

      this.logger.log('1️⃣ Seeding System Accounts (Bank Reserve & System Fee Revenue)...');
      const bankReserve = this.accountRepo.create({
        name: 'SYSTEM_BANK_RESERVE',
        accountType: AccountType.ASSET,
        cachedBalance: 5000000,
      });
      const feeRevenue = this.accountRepo.create({
        name: 'SYSTEM_FEE_REVENUE',
        accountType: AccountType.REVENUE,
        cachedBalance: 1500,
      });
      await this.accountRepo.save([bankReserve, feeRevenue]);

      this.logger.log('2️⃣ Seeding Users & Wallets...');
      const timestamp = Date.now();
      const usersData = [
        { email: `alice_${timestamp}@fintech.dev`, fullName: 'Alice Johnson', initialBalance: 1000000 },
        { email: `bob_${timestamp}@fintech.dev`, fullName: 'Bob Smith', initialBalance: 500000 },
        { email: `charlie_${timestamp}@fintech.dev`, fullName: 'Charlie Brown', initialBalance: 250000 },
      ];

      const seededUsers: Array<{ user: User; wallet: Wallet; account: Account }> = [];

      for (const userData of usersData) {
        const user = await this.userRepo.save(
          this.userRepo.create({ email: userData.email, fullName: userData.fullName }),
        );

        const wallet = await this.walletRepo.save(
          this.walletRepo.create({
            userId: user.id,
            currency: 'MMK',
            status: 'ACTIVE',
          }),
        );

        const account = await this.accountRepo.save(
          this.accountRepo.create({
            walletId: wallet.id,
            name: `${userData.fullName}'s Payable Account`,
            accountType: AccountType.LIABILITY,
            cachedBalance: userData.initialBalance,
          }),
        );

        seededUsers.push({ user, wallet, account });
      }

      const [alice, bob, charlie] = seededUsers;

      this.logger.log('3️⃣ Seeding Initial Deposit Transactions & Double-Entry Ledgers...');
      for (const item of seededUsers) {
        const depositTx = await this.txRepo.save(
          this.txRepo.create({
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.POSTED,
            totalAmount: item.account.cachedBalance,
            description: `Initial Capital Top-up for ${item.user.fullName}`,
            metadata: { channel: 'BANK_TRANSFER', reference: 'INIT-SEED' },
          }),
        );

        await this.ledgerRepo.save([
          this.ledgerRepo.create({
            transactionId: depositTx.id,
            accountId: bankReserve.id,
            direction: LedgerDirection.DEBIT,
            amount: item.account.cachedBalance,
          }),
          this.ledgerRepo.create({
            transactionId: depositTx.id,
            accountId: item.account.id,
            direction: LedgerDirection.CREDIT,
            amount: item.account.cachedBalance,
          }),
        ]);
      }

      this.logger.log('4️⃣ Seeding Sample P2P Transfer Transaction...');
      const transferKey = randomUUID();
      const p2pTx = await this.txRepo.save(
        this.txRepo.create({
          idempotencyKey: transferKey,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.POSTED,
          totalAmount: 100000,
          description: 'P2P Transfer from Alice to Bob',
          metadata: { sender: alice.user.fullName, receiver: bob.user.fullName },
        }),
      );

      await this.ledgerRepo.save([
        this.ledgerRepo.create({
          transactionId: p2pTx.id,
          accountId: alice.account.id,
          direction: LedgerDirection.DEBIT,
          amount: 100000,
        }),
        this.ledgerRepo.create({
          transactionId: p2pTx.id,
          accountId: bob.account.id,
          direction: LedgerDirection.CREDIT,
          amount: 100000,
        }),
      ]);

      this.logger.log('5️⃣ Seeding Sample Withdrawal Transaction with Fee...');
      const withdrawTx = await this.txRepo.save(
        this.txRepo.create({
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.POSTED,
          totalAmount: 51500,
          description: 'ATM Cash Withdrawal by Charlie',
          metadata: { fee: 1500, location: 'YANGON_ATM_01' },
        }),
      );

      await this.ledgerRepo.save([
        this.ledgerRepo.create({
          transactionId: withdrawTx.id,
          accountId: charlie.account.id,
          direction: LedgerDirection.DEBIT,
          amount: 51500,
        }),
        this.ledgerRepo.create({
          transactionId: withdrawTx.id,
          accountId: bankReserve.id,
          direction: LedgerDirection.CREDIT,
          amount: 50000,
        }),
        this.ledgerRepo.create({
          transactionId: withdrawTx.id,
          accountId: feeRevenue.id,
          direction: LedgerDirection.CREDIT,
          amount: 1500,
        }),
      ]);

      this.logger.log('6️⃣ Seeding Sample Idempotency Keys...');
      await this.idempotencyRepo.save([
        this.idempotencyRepo.create({
          key: transferKey,
          requestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: IdempotencyStatus.COMPLETED,
          responseBody: { status: 'SUCCESS', transactionId: p2pTx.id, amount: 100000 },
          statusCode: 201,
        }),
      ]);

      this.logger.log('7️⃣ Seeding Audit Logs...');
      await this.auditRepo.save([
        this.auditRepo.create({
          userId: alice.user.id,
          action: 'USER_LOGIN',
          resource: '/auth/login',
          payload: { device: 'iOS App' },
          ipAddress: '192.168.1.100',
          userAgent: 'FintechApp/1.0 (iPhone iOS 17)',
        }),
        this.auditRepo.create({
          userId: alice.user.id,
          action: 'P2P_TRANSFER_SUCCESS',
          resource: '/transactions/transfer',
          payload: { transactionId: p2pTx.id, amount: 100000 },
          ipAddress: '192.168.1.100',
          userAgent: 'FintechApp/1.0 (iPhone iOS 17)',
        }),
      ]);

      this.logger.log('✅ Seeding completed successfully across all entities!');
      return this.getDatabaseSummary();
    } catch (err: any) {
      this.logger.error(`❌ Seeding failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Seeding failed: ${err.message}`);
    }
  }

  /**
   * Summary overview of all seeded records in the database
   */
  async getDatabaseSummary() {
    const users = await this.userRepo.find();
    const wallets = await this.walletRepo.find({ relations: { accounts: true } });
    const accounts = await this.accountRepo.find();
    const transactions = await this.txRepo.find({ relations: { ledgerEntries: true } });
    const idempotencyKeys = await this.idempotencyRepo.find();
    const auditLogs = await this.auditRepo.find();

    return {
      message: 'Database Seeder Summary Overview',
      counts: {
        users: users.length,
        wallets: wallets.length,
        accounts: accounts.length,
        transactions: transactions.length,
        idempotencyKeys: idempotencyKeys.length,
        auditLogs: auditLogs.length,
      },
      users,
      wallets,
      accounts,
      transactions,
      idempotencyKeys,
      auditLogs,
    };
  }
}
