import { Wallet } from '../../wallets/entities/wallet.entity';
export declare class User {
    id: string;
    email: string;
    fullName: string;
    wallets: Wallet[];
    createdAt: Date;
    updatedAt: Date;
}
