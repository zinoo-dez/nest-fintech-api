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
exports.IdempotencyKey = void 0;
const typeorm_1 = require("typeorm");
const fintech_enum_1 = require("../../../common/enums/fintech.enum");
let IdempotencyKey = class IdempotencyKey {
    key;
    requestHash;
    status;
    responseBody;
    statusCode;
    createdAt;
    updatedAt;
};
exports.IdempotencyKey = IdempotencyKey;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "requestHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: fintech_enum_1.IdempotencyStatus,
        default: fintech_enum_1.IdempotencyStatus.STARTED,
    }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], IdempotencyKey.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], IdempotencyKey.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "updatedAt", void 0);
exports.IdempotencyKey = IdempotencyKey = __decorate([
    (0, typeorm_1.Entity)('idempotency_keys')
], IdempotencyKey);
//# sourceMappingURL=idempotency-key.entity.js.map