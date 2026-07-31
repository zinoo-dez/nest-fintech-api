"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_entity_1 = require("../wallets/entities/wallet.entity");
const account_entity_1 = require("../accounts/entities/account.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const ledger_entry_entity_1 = require("../transactions/entities/ledger-entry.entity");
const idempotency_key_entity_1 = require("../idempotency/entities/idempotency-key.entity");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
const seed_service_1 = require("./seed.service");
const seed_controller_1 = require("./seed.controller");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                wallet_entity_1.Wallet,
                account_entity_1.Account,
                transaction_entity_1.Transaction,
                ledger_entry_entity_1.LedgerEntry,
                idempotency_key_entity_1.IdempotencyKey,
                audit_log_entity_1.AuditLog,
            ]),
        ],
        controllers: [seed_controller_1.SeedController],
        providers: [seed_service_1.SeedService],
        exports: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map