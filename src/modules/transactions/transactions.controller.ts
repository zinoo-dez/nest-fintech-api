import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';

@Controller('transactions')
@UseInterceptors(IdempotencyInterceptor)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  async deposit(
    @Body() dto: DepositDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.transactionsService.deposit(dto, idempotencyKey);
  }

  @Post('transfer')
  async transfer(
    @Body() dto: TransferDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.transactionsService.transfer(dto, idempotencyKey);
  }

  @Post('withdraw')
  async withdraw(
    @Body() dto: WithdrawDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.transactionsService.withdraw(dto, idempotencyKey);
  }

  @Get('balance/:accountId/verify')
  async verifyBalance(@Param('accountId') accountId: string) {
    const computedBalance = await this.transactionsService.calculateBalanceFromLedger(
      accountId,
    );
    return {
      accountId,
      ledgerComputedBalance: computedBalance,
      isBalanced: true,
    };
  }
}
