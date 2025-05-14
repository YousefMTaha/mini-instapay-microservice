import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { MailService } from 'src/services/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { AccountService } from 'src/account/account.service';
import { UserService } from 'src/services/user.service';
import transactionModel from 'src/transaction.schema';

@Module({
  imports: [transactionModel],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    MailService,
    NotificationService,
    AccountService,
    UserService,
  ],
})
export class TransactionsModule {}
