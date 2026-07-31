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
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const fintech_enum_1 = require("../../../common/enums/fintech.enum");
const ledger_entry_entity_1 = require("../../transactions/entities/ledger-entry.entity");
let Account = class Account {
    id;
    walletId;
    wallet;
    name;
    accountType;
    cachedBalance;
    version;
    ledgerEntries;
    createdAt;
    updatedAt;
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Account.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.accounts, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'walletId' }),
    __metadata("design:type", Object)
], Account.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Account.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: fintech_enum_1.AccountType,
        default: fintech_enum_1.AccountType.LIABILITY,
    }),
    __metadata("design:type", String)
], Account.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 18,
        scale: 4,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        },
    }),
    __metadata("design:type", Number)
], Account.prototype, "cachedBalance", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], Account.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ledger_entry_entity_1.LedgerEntry, (entry) => entry.account),
    __metadata("design:type", Array)
], Account.prototype, "ledgerEntries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Account.prototype, "updatedAt", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts')
], Account);
//# sourceMappingURL=account.entity.js.map