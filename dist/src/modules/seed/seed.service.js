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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_entity_1 = require("../wallets/entities/wallet.entity");
const account_entity_1 = require("../accounts/entities/account.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const ledger_entry_entity_1 = require("../transactions/entities/ledger-entry.entity");
const idempotency_key_entity_1 = require("../idempotency/entities/idempotency-key.entity");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
const fintech_enum_1 = require("../../common/enums/fintech.enum");
const crypto_1 = require("crypto");
let SeedService = SeedService_1 = class SeedService {
    dataSource;
    userRepo;
    walletRepo;
    accountRepo;
    txRepo;
    ledgerRepo;
    idempotencyRepo;
    auditRepo;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(dataSource, userRepo, walletRepo, accountRepo, txRepo, ledgerRepo, idempotencyRepo, auditRepo) {
        this.dataSource = dataSource;
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
        this.ledgerRepo = ledgerRepo;
        this.idempotencyRepo = idempotencyRepo;
        this.auditRepo = auditRepo;
    }
    async seedAllEntities() {
        try {
            this.logger.log('🌱 Clearing existing database tables for fresh seeding...');
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
                accountType: fintech_enum_1.AccountType.ASSET,
                cachedBalance: 5000000,
            });
            const feeRevenue = this.accountRepo.create({
                name: 'SYSTEM_FEE_REVENUE',
                accountType: fintech_enum_1.AccountType.REVENUE,
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
            const seededUsers = [];
            for (const userData of usersData) {
                const user = await this.userRepo.save(this.userRepo.create({ email: userData.email, fullName: userData.fullName }));
                const wallet = await this.walletRepo.save(this.walletRepo.create({
                    userId: user.id,
                    currency: 'MMK',
                    status: 'ACTIVE',
                }));
                const account = await this.accountRepo.save(this.accountRepo.create({
                    walletId: wallet.id,
                    name: `${userData.fullName}'s Payable Account`,
                    accountType: fintech_enum_1.AccountType.LIABILITY,
                    cachedBalance: userData.initialBalance,
                }));
                seededUsers.push({ user, wallet, account });
            }
            const [alice, bob, charlie] = seededUsers;
            this.logger.log('3️⃣ Seeding Initial Deposit Transactions & Double-Entry Ledgers...');
            for (const item of seededUsers) {
                const depositTx = await this.txRepo.save(this.txRepo.create({
                    type: fintech_enum_1.TransactionType.DEPOSIT,
                    status: fintech_enum_1.TransactionStatus.POSTED,
                    totalAmount: item.account.cachedBalance,
                    description: `Initial Capital Top-up for ${item.user.fullName}`,
                    metadata: { channel: 'BANK_TRANSFER', reference: 'INIT-SEED' },
                }));
                await this.ledgerRepo.save([
                    this.ledgerRepo.create({
                        transactionId: depositTx.id,
                        accountId: bankReserve.id,
                        direction: fintech_enum_1.LedgerDirection.DEBIT,
                        amount: item.account.cachedBalance,
                    }),
                    this.ledgerRepo.create({
                        transactionId: depositTx.id,
                        accountId: item.account.id,
                        direction: fintech_enum_1.LedgerDirection.CREDIT,
                        amount: item.account.cachedBalance,
                    }),
                ]);
            }
            this.logger.log('4️⃣ Seeding Sample P2P Transfer Transaction...');
            const transferKey = (0, crypto_1.randomUUID)();
            const p2pTx = await this.txRepo.save(this.txRepo.create({
                idempotencyKey: transferKey,
                type: fintech_enum_1.TransactionType.TRANSFER,
                status: fintech_enum_1.TransactionStatus.POSTED,
                totalAmount: 100000,
                description: 'P2P Transfer from Alice to Bob',
                metadata: { sender: alice.user.fullName, receiver: bob.user.fullName },
            }));
            await this.ledgerRepo.save([
                this.ledgerRepo.create({
                    transactionId: p2pTx.id,
                    accountId: alice.account.id,
                    direction: fintech_enum_1.LedgerDirection.DEBIT,
                    amount: 100000,
                }),
                this.ledgerRepo.create({
                    transactionId: p2pTx.id,
                    accountId: bob.account.id,
                    direction: fintech_enum_1.LedgerDirection.CREDIT,
                    amount: 100000,
                }),
            ]);
            this.logger.log('5️⃣ Seeding Sample Withdrawal Transaction with Fee...');
            const withdrawTx = await this.txRepo.save(this.txRepo.create({
                type: fintech_enum_1.TransactionType.WITHDRAWAL,
                status: fintech_enum_1.TransactionStatus.POSTED,
                totalAmount: 51500,
                description: 'ATM Cash Withdrawal by Charlie',
                metadata: { fee: 1500, location: 'YANGON_ATM_01' },
            }));
            await this.ledgerRepo.save([
                this.ledgerRepo.create({
                    transactionId: withdrawTx.id,
                    accountId: charlie.account.id,
                    direction: fintech_enum_1.LedgerDirection.DEBIT,
                    amount: 51500,
                }),
                this.ledgerRepo.create({
                    transactionId: withdrawTx.id,
                    accountId: bankReserve.id,
                    direction: fintech_enum_1.LedgerDirection.CREDIT,
                    amount: 50000,
                }),
                this.ledgerRepo.create({
                    transactionId: withdrawTx.id,
                    accountId: feeRevenue.id,
                    direction: fintech_enum_1.LedgerDirection.CREDIT,
                    amount: 1500,
                }),
            ]);
            this.logger.log('6️⃣ Seeding Sample Idempotency Keys...');
            await this.idempotencyRepo.save([
                this.idempotencyRepo.create({
                    key: transferKey,
                    requestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                    status: fintech_enum_1.IdempotencyStatus.COMPLETED,
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
        }
        catch (err) {
            this.logger.error(`❌ Seeding failed: ${err.message}`, err.stack);
            throw new common_1.InternalServerErrorException(`Seeding failed: ${err.message}`);
        }
    }
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(3, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(4, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(5, (0, typeorm_1.InjectRepository)(ledger_entry_entity_1.LedgerEntry)),
    __param(6, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey)),
    __param(7, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map