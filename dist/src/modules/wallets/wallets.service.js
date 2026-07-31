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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const account_entity_1 = require("../accounts/entities/account.entity");
const fintech_enum_1 = require("../../common/enums/fintech.enum");
let WalletsService = class WalletsService {
    userRepo;
    walletRepo;
    accountRepo;
    constructor(userRepo, walletRepo, accountRepo) {
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
        this.accountRepo = accountRepo;
    }
    async createUserWithWallet(email, fullName) {
        const user = this.userRepo.create({ email, fullName });
        await this.userRepo.save(user);
        const wallet = this.walletRepo.create({
            userId: user.id,
            currency: 'MMK',
            status: 'ACTIVE',
        });
        await this.walletRepo.save(wallet);
        const account = this.accountRepo.create({
            walletId: wallet.id,
            name: `${fullName}'s Payable Account`,
            accountType: fintech_enum_1.AccountType.LIABILITY,
            cachedBalance: 0,
        });
        await this.accountRepo.save(account);
        return { user, wallet, account };
    }
    async getWalletDetails(walletId) {
        const wallet = await this.walletRepo.findOne({
            where: { id: walletId },
            relations: { user: true, accounts: true },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet with ID ${walletId} not found`);
        }
        return wallet;
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map