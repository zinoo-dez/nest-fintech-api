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
exports.LedgerEntry = void 0;
const typeorm_1 = require("typeorm");
const fintech_enum_1 = require("../../../common/enums/fintech.enum");
const transaction_entity_1 = require("./transaction.entity");
const account_entity_1 = require("../../accounts/entities/account.entity");
let LedgerEntry = class LedgerEntry {
    id;
    transactionId;
    transaction;
    accountId;
    account;
    direction;
    amount;
    createdAt;
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, (tx) => tx.ledgerEntries, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    __metadata("design:type", transaction_entity_1.Transaction)
], LedgerEntry.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, (account) => account.ledgerEntries, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'accountId' }),
    __metadata("design:type", account_entity_1.Account)
], LedgerEntry.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: fintech_enum_1.LedgerDirection,
    }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 18,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        },
    }),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "createdAt", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)('ledger_entries')
], LedgerEntry);
//# sourceMappingURL=ledger-entry.entity.js.map