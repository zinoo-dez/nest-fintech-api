"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const idempotency_service_1 = require("./idempotency.service");
const crypto = __importStar(require("crypto"));
let IdempotencyInterceptor = class IdempotencyInterceptor {
    idempotencyService;
    constructor(idempotencyService) {
        this.idempotencyService = idempotencyService;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const idempotencyKey = request.headers['x-idempotency-key'];
        if (!idempotencyKey) {
            return next.handle();
        }
        const payloadHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(request.body || {}) + request.url)
            .digest('hex');
        const { isCached, cachedData } = await this.idempotencyService.lockOrCheckKey(idempotencyKey, payloadHash);
        if (isCached) {
            return (0, rxjs_1.of)(cachedData);
        }
        request.idempotencyKey = idempotencyKey;
        return next.handle().pipe((0, operators_1.tap)(async (responseBody) => {
            await this.idempotencyService.saveResponse(idempotencyKey, responseBody);
        }), (0, operators_1.catchError)((err) => {
            this.idempotencyService.releaseKey(idempotencyKey).catch(() => { });
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
exports.IdempotencyInterceptor = IdempotencyInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [idempotency_service_1.IdempotencyService])
], IdempotencyInterceptor);
//# sourceMappingURL=idempotency.interceptor.js.map