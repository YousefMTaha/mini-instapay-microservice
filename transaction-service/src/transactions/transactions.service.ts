import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from 'src/services/email.service';
import { UserService } from 'src/services/user.service';
import { TransactionStatus, TransactionType } from 'src/transaction.constants';
import { Transaction, transactionType } from 'src/transaction.schema';
import {
  authForOptions,
  authTypes,
} from 'src/utils/Constants/system.constants';
import { AccountService } from 'src/account/account.service';
import { userType } from '../services/user.types';
import { accountType } from '../account/account.types';
import { FullyPopulatedTransaction } from '../transaction.types';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  async getById(tId: Types.ObjectId) {
    const transaction = await this.transactionModel.findById(tId);
    if (!transaction) {
      throw new NotFoundException('invalid transaction id');
    }
    return transaction;
  }

  async sendMoney(
    senderAcc: accountType,
    receiveAcc: accountType,
    amount: number,
  ) {
    senderAcc.Balance -= amount;
    await this.accountService.updateAccount(senderAcc);

    receiveAcc.Balance += amount;
    await this.accountService.updateAccount(receiveAcc);

    const transaction = await this.transactionModel.create({
      amount,
      accReceiverId: receiveAcc._id,
      accSenderId: senderAcc._id,
      type: TransactionType.SEND,
    });

    return transaction;
  }

  async checkNoOfTries(account: accountType, user: userType) {
    if (account.wrongPIN >= 5) {
      const emailToken = this.JwtService.sign(
        { accountId: account._id },
        { secret: this.configService.get<string>('EXCEED_TRYS') },
      );
      let send = true;
      let sendBefore = false;
      for (const type of user.authTypes) {
        if (
          type.authFor === authForOptions.INVALID_PIN &&
          type.type === authTypes.TOKEN
        ) {
          sendBefore = true;

          if (type.expireAt > new Date()) {
            send = false;
          } else {
            const nowDate = new Date();
            type.expireAt = new Date(
              nowDate.setMinutes(nowDate.getMinutes() + 10),
            );
            await this.userService.updateUser(user);
          }
          break;
        }
      }

      if (!sendBefore) {
        user.authTypes.push({
          authFor: authForOptions.INVALID_PIN,
          type: authTypes.TOKEN,
          value: emailToken,
          expireAt: new Date().setMinutes(
            new Date().getMinutes() + 10,
          ) as unknown as Date,
        });
        await this.userService.updateUser(user);
      }

      if (send) await this.sendToken(emailToken, user.email);

      throw new BadRequestException(
        'You entered the wrong PIN too many times, To continue trying, Check your email that linked with this account',
      );
    }
  }

  async sendToken(emailToken: string, email: string) {
    const url = `http://localhost:3000/account/verifyAccountUser/${emailToken}`;
    await this.mailService.sendEmail({
      to: email,
      subject: 'Reset PIN tries',
      html: `
      <h1> You entered PIN wrong many times on instapay </h1>
      <h2> we want to ensure that the account owner was trying.</h2>
      to continue to try enter the PIN <a href='${url}'> click this link </a>  
        `,
    });
    return {
      message: 'done',
      status: true,
    };
  }

  async changeDefaultAcc(user: userType, account: accountType) {
    user.defaultAcc = account._id;
    await this.userService.updateUser(user);
    return {
      message: 'Changed',
      status: true,
    };
  }

  async getHistory(user: userType) {
    const userAccounts = await this.accountService.getUserAccounts(
      user._id.toString(),
    );

    if (!userAccounts.length) {
      throw new NotFoundException('No accounts found for this user');
    }

    const userAccountIds = userAccounts.map((acc) => acc._id);

    console.log({ userAccountIds });

    const transactions = await this.transactionModel
      .find({
        $or: [
          { accSenderId: { $in: userAccountIds } },
          { accReceiverId: { $in: userAccountIds } },
        ],
      })
      .sort({ createdAt: -1 });

    if (!transactions.length) {
      throw new NotFoundException('No transactions yet');
    }

    console.log(transactions);

    const accountIds = [
      ...transactions.map((t) => t.accSenderId.toString()),
      ...transactions.map((t) => t.accReceiverId.toString()),
    ];
    const uniqueAccountIds = [...new Set(accountIds)] as string[];

    const accounts =
      await this.accountService.getManyAccounts(uniqueAccountIds);

    const userIds = accounts.map((acc) => acc.userId.toString());
    const uniqueUserIds = [...new Set(userIds)] as string[];

    const users = await this.userService.getManyUsers(uniqueUserIds);

    const accountMap = new Map(
      accounts.map((acc) => [acc._id.toString(), acc]),
    );
    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          userName: `${u.firstName} ${u.lastName}`,
        },
      ]),
    );

    const result = transactions.map((t) => {
      const senderAcc = accountMap.get(t.accSenderId.toString()) as accountType;
      const receiverAcc = accountMap.get(
        t.accReceiverId.toString(),
      ) as accountType;

      const transactionObj = t.toObject();

      const formattedTransaction = {
        _id: transactionObj._id,
        status: transactionObj.status,
        type: transactionObj.type,
        amount: transactionObj.amount,
        createdAt: transactionObj.createdAt,
        sender: userMap.get(senderAcc?.userId?.toString() || ''),
        receiver: userMap.get(receiverAcc?.userId?.toString() || ''),
      };

      return formattedTransaction;
    });

    return {
      message: 'done',
      status: true,
      data: result,
    };
  }

  async receiveMoney(
    senderAcc: accountType,
    recAcc: accountType,
    amount: number,
  ) {
    const transaction = await this.transactionModel.create({
      amount,
      accSenderId: senderAcc._id,
      accReceiverId: recAcc._id,
      status: TransactionStatus.PENDING,
      type: TransactionType.RECEIVE,
    });

    return transaction;
  }

  async confirmReceive(
    senderAccount: accountType,
    receiverAccount: accountType,
    transaction: transactionType,
  ) {
    senderAccount.Balance -= transaction.amount;
    await this.accountService.updateAccount(senderAccount);

    receiverAccount.Balance += transaction.amount;
    await this.accountService.updateAccount(receiverAccount);

    transaction.status = TransactionStatus.SUCCESS;
    await transaction.save();

    return { message: 'done', status: true };
  }

  async rejectReceive(sender: userType, transaction: transactionType) {
    transaction.status = TransactionStatus.FAILED;
    await transaction.save();

    return { message: 'done', status: true };
  }

  checkTransactionStatus(transaction: transactionType) {
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        `Transaction already ${transaction.status}`,
      );
    }
  }

  async checkTransactionOwner(transaction: transactionType, sender: userType) {
    const account = await this.accountService.getAccountById(
      sender._id,
      transaction.accSenderId,
      'OWNER',
    );

    if (!account) {
      throw new ForbiddenException('Not allowed to access this transaction');
    }
  }

  async getAllTransactions() {
    const transactions = await this.transactionModel
      .find()
      .sort({ createdAt: -1 });

    const accountIds = [
      ...transactions.map((t) => t.accSenderId.toString()),
      ...transactions.map((t) => t.accReceiverId.toString()),
    ];
    const uniqueAccountIds = [...new Set(accountIds)];

    const accounts =
      await this.accountService.getManyAccounts(uniqueAccountIds);

    const userIds = accounts.map((acc) => acc.userId.toString());
    const uniqueUserIds = [...new Set(userIds)];

    const users = await this.userService.getManyUsers(uniqueUserIds);

    const accountMap = new Map(
      accounts.map((acc) => [acc._id.toString(), acc]),
    );
    const userMap = new Map(
      users.map((user) => [
        user._id.toString(),
        {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: `${user.firstName} ${user.lastName}`,
        },
      ]),
    );

    const formattedTransactions = transactions.map((transaction) => {
      const senderAccount = accountMap.get(transaction.accSenderId.toString());
      const receiverAccount = accountMap.get(
        transaction.accReceiverId.toString(),
      );

      const sender = userMap.get(senderAccount?.userId?.toString());
      const receiver = userMap.get(receiverAccount?.userId?.toString());

      return {
        _id: transaction._id,
        status: transaction.status,
        type: transaction.type,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        sender,
        receiver,
      };
    });

    return formattedTransactions;
  }

  async suspiciousTransaction(transactionId: Types.ObjectId) {
    const transaction = await this.transactionModel.findById(transactionId);

    if (!transaction) throw new NotFoundException('invalid transaction id');
    if (transaction.status == TransactionStatus.SUSPICIOUS)
      throw new BadRequestException('transaction already reported before');

    const senderAccount = await this.accountService.getAccount(
      transaction.accSenderId,
    );
    const receiverAccount = await this.accountService.getAccount(
      transaction.accReceiverId,
    );

    // Get the sender and receiver user details
    const senderUser = await this.userService.findUser({
      id: senderAccount.userId,
    });
    const receiverUser = await this.userService.findUser({
      id: receiverAccount.userId,
    });

    await this.mailService.sendEmail({
      to: senderUser.email,
      subject: 'Suspicious Transaction',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Report - Suspicious Transaction</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 50px;
        }
        .header {
            text-align: center;
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
        }
        .report-content {
            font-size: 16px;
            color: #555;
        }
        .report-content p {
            margin: 10px 0;
        }
        .highlight {
            font-weight: bold;
            color: #d9534f;
        }
        .info {
            font-weight: bold;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>ADMIN REPORT</h1>
        </div>
        
        <div class="report-content">
            <p>Your transaction with this information was reported as <span class="highlight">suspicious</span>:</p>
            <p><span class="info">Send to:</span> ${receiverUser.email}</p>
            <p><span class="info">Amount:</span> ${transaction.amount} EGP</p>
            <p><span class="info">Send time:</span> ${transaction.createdAt}</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Admin Report System</p>
        </div>
    </div>

</body>
</html>
      `,
    });

    transaction.status = TransactionStatus.SUSPICIOUS;
    await transaction.save();

    return {
      message: 'Reported',
      status: true,
    };
  }

  async requestRefund(transaction: transactionType) {
    transaction.status = TransactionStatus.REFUNDING;
    await transaction.save();
    return {
      message: 'Waiting for admin to approve',
      status: true,
    };
  }

  checkForRefund(transaction: transactionType, loginUser?: boolean) {
    if (loginUser) {
      if (transaction.status == TransactionStatus.REFUNDING)
        throw new BadRequestException(
          'You already request to refund, wait for admin to approve',
        );
      if (transaction.status == TransactionStatus.REFUNDED)
        throw new BadRequestException(
          'This transaction already refunded before',
        );
    } else {
      if (transaction.status != TransactionStatus.REFUNDING) {
        throw new BadRequestException('Transaction already solved before');
      }
    }
  }

  async approveRefund(
    transaction: transactionType,
    senderAcc: accountType,
    receiverAcc: accountType,
  ) {
    senderAcc.Balance += transaction.amount;
    await this.accountService.updateAccount(senderAcc);

    receiverAcc.Balance -= transaction.amount;
    await this.accountService.updateAccount(receiverAcc);

    transaction.status = TransactionStatus.REFUNDED;
    await transaction.save();
    return {
      message: 'Refunded',
      status: true,
    };
  }

  async rejectRefund(transaction: transactionType) {
    transaction.status = TransactionStatus.SUCCESS;
    await transaction.save();

    return {
      message: 'Rejected',
      status: true,
    };
  }
}
