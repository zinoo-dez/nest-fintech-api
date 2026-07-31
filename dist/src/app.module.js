"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./modules/users/entities/user.entity");
const wallet_entity_1 = require("./modules/wallets/entities/wallet.entity");
const account_entity_1 = require("./modules/accounts/entities/account.entity");
const transaction_entity_1 = require("./modules/transactions/entities/transaction.entity");
const ledger_entry_entity_1 = require("./modules/transactions/entities/ledger-entry.entity");
const idempotency_key_entity_1 = require("./modules/idempotency/entities/idempotency-key.entity");
const audit_log_entity_1 = require("./modules/audit/entities/audit-log.entity");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const idempotency_module_1 = require("./modules/idempotency/idempotency.module");
const audit_module_1 = require("./modules/audit/audit.module");
const seed_module_1 = require("./modules/seed/seed.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const dbType = configService.get('DB_TYPE', 'sqlite');
                    if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
                        return {
                            type: 'better-sqlite3',
                            database: 'fintech_local.sqlite',
                            entities: [
                                user_entity_1.User,
                                wallet_entity_1.Wallet,
                                account_entity_1.Account,
                                transaction_entity_1.Transaction,
                                ledger_entry_entity_1.LedgerEntry,
                                idempotency_key_entity_1.IdempotencyKey,
                                audit_log_entity_1.AuditLog,
                            ],
                            synchronize: true,
                        };
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'fintech_user'),
                        password: configService.get('DB_PASSWORD', 'fintech_secret'),
                        database: configService.get('DB_DATABASE', 'fintech_db'),
                        entities: [
                            user_entity_1.User,
                            wallet_entity_1.Wallet,
                            account_entity_1.Account,
                            transaction_entity_1.Transaction,
                            ledger_entry_entity_1.LedgerEntry,
                            idempotency_key_entity_1.IdempotencyKey,
                            audit_log_entity_1.AuditLog,
                        ],
                        synchronize: true,
                        extra: {
                            max: 20,
                        },
                    };
                },
            }),
            wallets_module_1.WalletsModule,
            transactions_module_1.TransactionsModule,
            idempotency_module_1.IdempotencyModule,
            audit_module_1.AuditModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map