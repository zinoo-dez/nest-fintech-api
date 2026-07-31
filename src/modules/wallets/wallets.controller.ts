import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class CreateUserWalletDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async createWallet(@Body() dto: CreateUserWalletDto) {
    return this.walletsService.createUserWithWallet(dto.email, dto.fullName);
  }

  @Get(':id')
  async getWallet(@Param('id') id: string) {
    return this.walletsService.getWalletDetails(id);
  }
}
