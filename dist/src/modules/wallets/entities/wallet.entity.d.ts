import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
export declare class Wallet {
    id: string;
    userId: string;
    user: User;
    currency: string;
    status: string;
    accounts: Account[];
    createdAt: Date;
    updatedAt: Date;
}
