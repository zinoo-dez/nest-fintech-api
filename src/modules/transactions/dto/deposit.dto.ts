import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, IsOptional } from 'class-validator';

export class DepositDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
