import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../../common/enums/fintech.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async createUserWithWallet(email: string, fullName: string): Promise<{ user: User; wallet: Wallet; account: Account }> {
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
      accountType: AccountType.LIABILITY,
      cachedBalance: 0,
    });
    await this.accountRepo.save(account);

    return { user, wallet, account };
  }

  async getWalletDetails(walletId: string) {
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      relations: { user: true, accounts: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return wallet;
  }
}
