import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, IsOptional, Min } from 'class-validator';

export class WithdrawDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @IsOptional()
  feeAmount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
