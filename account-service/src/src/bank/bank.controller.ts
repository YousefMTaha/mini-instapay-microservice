import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankIdDTO } from './dto/get-bank-id.dto';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  getAllBanks() {
    return this.bankService.getBanks();
  }

  @Post('getBankById')
  getBankById(@Body() body: BankIdDTO) {
    return this.bankService.checkBankId(body.bankId);
  }
}
