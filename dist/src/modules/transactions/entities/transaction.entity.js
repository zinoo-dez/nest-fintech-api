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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const fintech_enum_1 = require("../../../common/enums/fintech.enum");
const ledger_entry_entity_1 = require("./ledger-entry.entity");
let Transaction = class Transaction {
    id;
    idempotencyKey;
    type;
    status;
    totalAmount;
    description;
    metadata;
    ledgerEntries;
    createdAt;
    updatedAt;
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "idempotencyKey", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: fintech_enum_1.TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: fintech_enum_1.TransactionStatus,
        default: fintech_enum_1.TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
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
], Transaction.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ledger_entry_entity_1.LedgerEntry, (entry) => entry.transaction, { cascade: true }),
    __metadata("design:type", Array)
], Transaction.prototype, "ledgerEntries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map