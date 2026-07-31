import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Account } from '../accounts/entities/account.entity';
export declare class WalletsService {
    private readonly userRepo;
    private readonly walletRepo;
    private readonly accountRepo;
    constructor(userRepo: Repository<User>, walletRepo: Repository<Wallet>, accountRepo: Repository<Account>);
    createUserWithWallet(email: string, fullName: string): Promise<{
        user: User;
        wallet: Wallet;
        account: Account;
    }>;
    getWalletDetails(walletId: string): Promise<Wallet>;
}
