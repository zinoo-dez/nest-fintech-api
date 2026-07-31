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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idempotency_key_entity_1 = require("./entities/idempotency-key.entity");
const fintech_enum_1 = require("../../common/enums/fintech.enum");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("@nestjs/config");
let IdempotencyService = class IdempotencyService {
    idempotencyRepo;
    configService;
    redisClient = null;
    ttlSeconds;
    constructor(idempotencyRepo, configService) {
        this.idempotencyRepo = idempotencyRepo;
        this.configService = configService;
        this.ttlSeconds = this.configService.get('IDEMPOTENCY_TTL_SECONDS', 86400);
        try {
            this.redisClient = new ioredis_1.default({
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: this.configService.get('REDIS_PORT', 6379),
                lazyConnect: true,
                maxRetriesPerRequest: 1,
            });
            this.redisClient.connect().catch(() => {
                console.warn('⚠️ Redis server offline, falling back to PostgreSQL for Idempotency tracking.');
                this.redisClient = null;
            });
        }
        catch {
            this.redisClient = null;
        }
    }
    async lockOrCheckKey(key, requestHash) {
        if (this.redisClient) {
            const redisData = await this.redisClient.get(`idempotency:${key}`);
            if (redisData) {
                const parsed = JSON.parse(redisData);
                if (parsed.status === fintech_enum_1.IdempotencyStatus.COMPLETED) {
                    return { isCached: true, cachedData: parsed.responseBody };
                }
                if (parsed.status === fintech_enum_1.IdempotencyStatus.STARTED) {
                    throw new common_1.ConflictException('A transaction with this Idempotency Key is already processing.');
                }
            }
            await this.redisClient.set(`idempotency:${key}`, JSON.stringify({ status: fintech_enum_1.IdempotencyStatus.STARTED, requestHash }), 'EX', this.ttlSeconds);
        }
        let record = await this.idempotencyRepo.findOne({ where: { key } });
        if (record) {
            if (record.status === fintech_enum_1.IdempotencyStatus.COMPLETED) {
                return { isCached: true, cachedData: record.responseBody };
            }
            if (record.status === fintech_enum_1.IdempotencyStatus.STARTED) {
                throw new common_1.ConflictException('A transaction with this Idempotency Key is currently processing.');
            }
        }
        record = this.idempotencyRepo.create({
            key,
            requestHash,
            status: fintech_enum_1.IdempotencyStatus.STARTED,
        });
        await this.idempotencyRepo.save(record);
        return { isCached: false };
    }
    async saveResponse(key, responseBody, statusCode = 201) {
        if (this.redisClient) {
            await this.redisClient.set(`idempotency:${key}`, JSON.stringify({
                status: fintech_enum_1.IdempotencyStatus.COMPLETED,
                responseBody,
                statusCode,
            }), 'EX', this.ttlSeconds);
        }
        await this.idempotencyRepo.update(key, {
            status: fintech_enum_1.IdempotencyStatus.COMPLETED,
            responseBody,
            statusCode,
        });
    }
    async releaseKey(key) {
        if (this.redisClient) {
            await this.redisClient.del(`idempotency:${key}`);
        }
        await this.idempotencyRepo.delete(key);
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map