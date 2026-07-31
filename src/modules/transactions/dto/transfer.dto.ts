import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, IsOptional } from 'class-validator';

export class TransferDto {
  @IsUUID()
  @IsNotEmpty()
  senderWalletId: string;

  @IsUUID()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
