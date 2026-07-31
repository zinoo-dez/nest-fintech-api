import { WalletsService } from './wallets.service';
declare class CreateUserWalletDto {
    email: string;
    fullName: string;
}
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    createWallet(dto: CreateUserWalletDto): Promise<{
        user: import("../users/entities/user.entity").User;
        wallet: import("./entities/wallet.entity").Wallet;
        account: import("../accounts/entities/account.entity").Account;
    }>;
    getWallet(id: string): Promise<import("./entities/wallet.entity").Wallet>;
}
export {};
