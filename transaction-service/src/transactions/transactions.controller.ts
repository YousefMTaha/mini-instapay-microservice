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
import { SendMoneyDTO } from './dto/send-money.dto';
import { transactionType } from 'src/transaction.schema';
import { currentUser } from 'src/decorators/current-user.decorator';
import { UserService } from 'src/services/user.service';
import { AccountService } from 'src/account/account.service';
import { EaccountType, userRoles } from 'src/utils/Constants/system.constants';
import { NotificationService } from 'src/notification/notification.service';

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
  async sendMoney(@currentUser() sender: any, @Body() body: SendMoneyDTO) {
    let senderAccount: any;
    if (body.accountId) {
      senderAccount = await this.accountService.getAccountById(
        sender._id,
        body.accountId,
        EaccountType.OWNER,
      );
    } else {
      senderAccount = await this.accountService.checkDefaultAcc(
        sender,
        EaccountType.OWNER,
      );
    }

    await this.accountService.checkPIN(sender, senderAccount, body.PIN);

    if (body.amount > senderAccount.Balance)
      throw new BadRequestException("You don't have enough money");

    await this.accountService.checkLimit(body.amount, senderAccount);

    const receiver = await this.userService.findUser({
      data: body.receiverData,
    });

    const receiveAccount = await this.accountService.checkDefaultAcc(
      receiver,
      EaccountType.RECEIVER,
    );

    const transaction = await this.transactionsService.sendMoney(
      senderAccount,
      receiveAccount,
      body.amount,
    );

    return this.notificationService.sendOrRecieve(
      sender,
      receiver,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Get('history')
  getHistory(@currentUser() user: any) {
    return this.transactionsService.getHistory(user);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Patch('change-default')
  async changeDefault(
    @currentUser() user: any,
    @Body('accountId') accountId: Types.ObjectId,
  ) {
    if (user.defaultAcc.toString() == accountId.toString()) {
      throw new BadRequestException("It's already the default account");
    }
    const account = await this.accountService.getAccountById(
      user._id,
      accountId,
      EaccountType.OWNER,
    );
    return this.transactionsService.changeDefaultAcc(user, account);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('request-recieve-money')
  async reqRecieveMoney(@currentUser() reciever: any, @Body() body: any) {
    let recieverAcc: any;
    if (body.accountId) {
      recieverAcc = await this.accountService.getAccountById(
        reciever._id,
        body.accountId,
        EaccountType.RECEIVER,
      );
    } else {
      recieverAcc = await this.accountService.checkDefaultAcc(
        reciever,
        EaccountType.RECEIVER,
      );
    }

    const sender = await this.userService.findUser({ data: body.reciverData });

    const senderAcc = await this.accountService.checkDefaultAcc(
      sender,
      EaccountType.SENDER,
    );

    const transaction = await this.transactionsService.receiveMoney(
      senderAcc,
      recieverAcc,
      body.amount,
    );

    return this.notificationService.recieveRequest(
      sender,
      reciever,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('confirm-recieve/:transactionId')
  async confirmRec(
    @currentUser() sender: any,
    @Param('transactionId') transactionId: Types.ObjectId,
    @Body() body: any,
  ) {
    const transaction = (await this.transactionsService.getById(
      transactionId,
    )) as transactionType;

    const receiverAcc = await this.userService.findUser({
      id: transaction.accRecieverId,
    });

    this.transactionsService.checkTransactionStatus(transaction);
    await this.transactionsService.checkTransactionOwner(transaction, sender);

    let senderAccount: any;
    if (body.accountId) {
      senderAccount = await this.accountService.getAccountById(
        sender._id,
        body.accountId,
        EaccountType.OWNER,
      );
    } else {
      senderAccount = await this.accountService.checkDefaultAcc(
        sender,
        EaccountType.OWNER,
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
      EaccountType.RECEIVER,
    );

    await this.transactionsService.confirmReceive(
      senderAccount,
      receiveAccount,
      transaction,
    );

    return this.notificationService.sendOrRecieve(
      sender,
      receiver,
      transaction._id,
      transaction.amount,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('reject-recieve/:transactionId')
  async rejectRec(
    @currentUser() sender: any,
    @Param('transactionId') transactionId: Types.ObjectId,
  ) {
    const transaction = await (
      await this.transactionsService.getById(transactionId)
    ).populate('accSenderId');

    this.transactionsService.checkTransactionStatus(transaction);

    await this.transactionsService.rejectReceive(sender, transaction);

    return this.notificationService.rejectSend(
      sender.email,
      transaction.accRecieverId as Types.ObjectId,
      transaction._id,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.User))
  @Post('request-refund')
  async requestRefund(@currentUser() user: any, @Body() data: any) {
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
    return this.transactionsService.getAllTransacions();
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/suspiciousTransaction')
  suspiciousTransaction(@Body('transactionId') transactionId: Types.ObjectId) {
    return this.transactionsService.suspiciousTransaction(transactionId);
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/approve-refund')
  async approveRefund(@Body('transactionId') transationId: Types.ObjectId) {
    const transaction = await this.transactionsService.getById(transationId);

    this.transactionsService.checkForRefund(transaction);

    const recieverAcc = await this.accountService.getAccount(
      transaction.accRecieverId as Types.ObjectId,
    );
    const senderAcc = await this.accountService.getAccount(
      transaction.accSenderId as Types.ObjectId,
    );

    const reciever = await this.userService.findUser({
      id: recieverAcc.userId,
    });
    const sender = await this.userService.findUser({ id: senderAcc.userId });

    await this.notificationService.approveRefund(transaction, sender, reciever);

    return this.transactionsService.approveRefund(
      transaction,
      senderAcc,
      recieverAcc,
    );
  }

  @UseGuards(SharedAuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/reject-refund')
  async rejectRefund(@Body('transactionId') transationId: Types.ObjectId) {
    const transaction = await this.transactionsService.getById(transationId);

    this.transactionsService.checkForRefund(transaction);

    const recieverAcc = await this.accountService.getAccount(
      transaction.accRecieverId as Types.ObjectId,
    );
    const senderAcc = await this.accountService.getAccount(
      transaction.accSenderId as Types.ObjectId,
    );

    const reciever = await this.userService.findUser({
      id: recieverAcc.userId,
    });
    const sender = await this.userService.findUser({ id: senderAcc.userId });

    await this.notificationService.rejectRefund(
      transaction,
      sender._id,
      reciever,
    );

    return this.transactionsService.rejectRefund(transaction);
  }

  // internal-network (docker)
  @Post('checkNoOfTries')
  checkNoOfTries(@Body() body: any) {
    return this.transactionsService.checkNoOfTries(body.account, body.user);
  }
}
