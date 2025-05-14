import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import accountModel from '../schemas/account.schema';
import cardModel from '../schemas/card.schema';
import { CardService } from '../card/card.service';
import { MailService } from 'src/utils/email.service';
import { TransactionService } from '../transaction/transaction.service';
import { NotificationService } from '../notification/notification.service';
import bankModel from '../schemas/bank.schema';

@Module({
  controllers: [AccountController],
  providers: [
    AccountService,
    CardService,
    MailService,
    TransactionService,
    NotificationService,
  ],
  imports: [accountModel, cardModel, bankModel],
})
export class AccountModule {}
