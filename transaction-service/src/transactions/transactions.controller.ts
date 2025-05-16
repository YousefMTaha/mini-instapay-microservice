import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SharedAuthGuard } from 'src/guards/auth.guard';
import { Types } from 'mongoose';
import { AuthorizationGuard } from 'src/guards/Authorization.guard';
import { transactionType } from 'src/transaction.schema';
import { currentUser } from 'src/decorators/current-user.decorator';
import { UserService } from 'src/services/user.service';
import { AccountService } from 'src/account/account.service';
import { EAccountType, userRoles } from 'src/utils/Constants/system.constants';
import { NotificationService } from 'src/notification/notification.service';
import { userType } from '../services/user.types';
import { accountType } from '../account/account.types';
import { SendMoneyDTO } from './dto/send-money.dto';
import { RequestReceiveMoneyDTO } from './dto/request-receive-money.dto';
import { ConfirmReceiveDTO } from './dto/confirm-receive.dto';
import { TransactionIdParamDTO } from './dto/transaction-id-param.dto';
import { RequestRefundDTO } from './dto/request-refund.dto';
import { CheckNoOfTriesDTO } from './dto/check-no-of-tries.dto';
import { ApproveRejectRefundDTO } from './dto/approve-reject-refund.dto';

@Controller('transaction')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('/send-money')
  async sendMoney(@currentUser() sender: userType, @Body() body: SendMoneyDTO) {
    let senderAccount: accountType;
    if (body.accountId) {
      senderAccount = await this.accountService.getAccountById(
        sender._id,
        body.accountId,
        EAccountType.OWNER,
      );
    } else {
      senderAccount = await this.accountService.checkDefaultAcc(
        sender,
        EAccountType.OWNER,
      );
    }
    console.log({ senderAccount });

    await this.accountService.checkPIN(sender, senderAccount, body.PIN);

    if (body.amount > senderAccount.Balance)
      throw new BadRequestException("You don't have enough money");

    await this.accountService.checkLimit(body.amount, senderAccount);

    const receiver = await this.userService.findUser({
      data: body.receiverData,
    });

    const receiveAccount = await this.accountService.checkDefaultAcc(
      receiver,
      EAccountType.RECEIVER,
    );

    const transaction = await this.transactionsService.sendMoney(
      senderAccount,
      receiveAccount,
      body.amount,
    );

    return this.notificationService.sendOrReceive(
      sender,
      receiver,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Get('history')
  getHistory(@currentUser() user: userType) {
    return this.transactionsService.getHistory(user);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Patch('change-default')
  async changeDefault(
    @currentUser() user: userType,
    @Body('accountId') accountId: Types.ObjectId,
  ) {
    if (user.defaultAcc.toString() == accountId.toString()) {
      throw new BadRequestException("It's already the default account");
    }
    const account = await this.accountService.getAccountById(
      user._id,
      accountId,
      EAccountType.OWNER,
    );
    return this.transactionsService.changeDefaultAcc(user, account);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('request-receive-money')
  async reqReceiveMoney(
    @currentUser() receiver: userType,
    @Body() body: RequestReceiveMoneyDTO,
  ) {
    let receiverAcc: accountType;
    if (body.accountId) {
      receiverAcc = await this.accountService.getAccountById(
        receiver._id,
        body.accountId,
        EAccountType.RECEIVER,
      );
    } else {
      receiverAcc = await this.accountService.checkDefaultAcc(
        receiver,
        EAccountType.RECEIVER,
      );
    }

    const sender = await this.userService.findUser({ data: body.receiverData });

    const senderAcc = await this.accountService.checkDefaultAcc(
      sender,
      EAccountType.SENDER,
    );

    const transaction = await this.transactionsService.receiveMoney(
      senderAcc,
      receiverAcc,
      body.amount,
    );

    return this.notificationService.receiveRequest(
      sender,
      receiver,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('confirm-receive/:transactionId')
  async confirmReceive(
    @currentUser() sender: userType,
    @Param() param: TransactionIdParamDTO,
    @Body() body: ConfirmReceiveDTO,
  ) {
    const transaction = (await this.transactionsService.getById(
      param.transactionId,
    )) as transactionType;

    const receiverAcc = await this.accountService.getAccount(
      transaction.accReceiverId as Types.ObjectId,
    );

    this.transactionsService.checkTransactionStatus(transaction);
    await this.transactionsService.checkTransactionOwner(transaction, sender);

    let senderAccount: accountType;
    if (body.accountId) {
      senderAccount = await this.accountService.getAccountById(
        sender._id,
        body.accountId,
        EAccountType.OWNER,
      );
    } else {
      senderAccount = await this.accountService.checkDefaultAcc(
        sender,
        EAccountType.OWNER,
      );
    }

    await this.accountService.checkPIN(sender, senderAccount, body.PIN);

    if (transaction.amount > senderAccount.Balance)
      throw new BadRequestException("You don't have enough money");

    await this.accountService.checkLimit(transaction.amount, senderAccount);

    const receiver = await this.userService.findUser({
      id: receiverAcc.userId as Types.ObjectId,
    });

    const receiveAccount = await this.accountService.checkDefaultAcc(
      receiver,
      EAccountType.RECEIVER,
    );

    await this.transactionsService.confirmReceive(
      senderAccount,
      receiveAccount,
      transaction,
    );

    return this.notificationService.sendOrReceive(
      sender,
      receiver,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('reject-receive/:transactionId')
  async rejectReceive(
    @currentUser() sender: userType,
    @Param() param: TransactionIdParamDTO,
  ) {
    const transaction = (await this.transactionsService.getById(
      param.transactionId,
    )) as transactionType;

    const receiverAcc = await this.accountService.getAccount(
      transaction.accReceiverId as Types.ObjectId,
    );

    this.transactionsService.checkTransactionStatus(transaction);

    await this.transactionsService.rejectReceive(sender, transaction);

    return this.notificationService.rejectSend(
      sender.email,
      receiverAcc.userId as Types.ObjectId,
      transaction._id,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('request-refund')
  async requestRefund(
    @currentUser() user: userType,
    @Body() data: RequestRefundDTO,
  ) {
    const { transactionId, reason } = data;
    const transaction = await this.transactionsService.getById(transactionId);

    await this.transactionsService.checkTransactionOwner(transaction, user);
    this.transactionsService.checkForRefund(transaction, true);

    const admins = await this.userService.getAllAdmins();

    await this.notificationService.requestRefund(
      user,
      transaction,
      reason,
      admins,
    );

    return this.transactionsService.requestRefund(transaction);
  }

  // Admin
  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Get('admin')
  getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/suspiciousTransaction')
  suspiciousTransaction(@Body('transactionId') transactionId: Types.ObjectId) {
    return this.transactionsService.suspiciousTransaction(transactionId);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/approve-refund')
  async approveRefund(@Body() body: ApproveRejectRefundDTO) {
    const transaction = await this.transactionsService.getById(
      body.transactionId,
    );

    this.transactionsService.checkForRefund(transaction);

    const receiverAcc = await this.accountService.getAccount(
      transaction.accReceiverId as Types.ObjectId,
    );
    const senderAcc = await this.accountService.getAccount(
      transaction.accSenderId as Types.ObjectId,
    );

    const receiver = await this.userService.findUser({
      id: receiverAcc.userId,
    });
    const sender = await this.userService.findUser({ id: senderAcc.userId });

    await this.notificationService.approveRefund(transaction, sender, receiver);

    return this.transactionsService.approveRefund(
      transaction,
      senderAcc,
      receiverAcc,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/reject-refund')
  async rejectRefund(@Body() body: ApproveRejectRefundDTO) {
    const transaction = await this.transactionsService.getById(
      body.transactionId,
    );

    this.transactionsService.checkForRefund(transaction);

    const receiverAcc = await this.accountService.getAccount(
      transaction.accReceiverId as Types.ObjectId,
    );
    const senderAcc = await this.accountService.getAccount(
      transaction.accSenderId as Types.ObjectId,
    );

    const receiver = await this.userService.findUser({
      id: receiverAcc.userId,
    });
    const sender = await this.userService.findUser({ id: senderAcc.userId });

    await this.notificationService.rejectRefund(
      transaction,
      sender._id,
      receiver,
    );

    return this.transactionsService.rejectRefund(transaction);
  }

  // internal-network (docker)
  @Post('checkNoOfTries')
  checkNoOfTries(@Body() body: CheckNoOfTriesDTO) {
    return this.transactionsService.checkNoOfTries(body.account, body.user);
  }
}
