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

  async sendMoney(senderAcc: any, receiveAcc: any, amount: any) {
    senderAcc.Balance -= amount;
    await this.accountService.updateAccount(senderAcc);

    receiveAcc.Balance += amount;
    await this.accountService.updateAccount(receiveAcc);

    const transaction = await this.transactionModel.create({
      amount,
      accRecieverId: receiveAcc._id,
      accSenderId: senderAcc._id,
      type: TransactionType.SEND,
    });

    return transaction;
  }

  async checkNoOfTries(account: any, user: any) {
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
      subject: 'Reset PIN trys',
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

  async changeDefaultAcc(user: any, account: any) {
    user.defaultAcc = account._id;
    await this.userService.updateUser(user);
    return {
      message: 'Changed',
      status: true,
    };
  }

  async getHistory(user: any) {
    const userAccounts = await this.accountService.getUserAccounts(user._id);

    if (!userAccounts.length) {
      throw new NotFoundException('No accounts found for this user');
    }

    const userAccountIds = userAccounts.map((acc) => acc._id);

    console.log({ userAccountIds });

    const transactions = await this.transactionModel
      .find({
        $or: [
          { accSenderId: { $in: userAccountIds } },
          { accRecieverId: { $in: userAccountIds } },
        ],
      })
      .sort({ createdAt: -1 });

    if (!transactions.length) {
      throw new NotFoundException('No transactions yet');
    }

    const accountIds = [
      ...transactions.map((t) => t.accSenderId.toString()),
      ...transactions.map((t) => t.accRecieverId.toString()),
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
      const senderAcc = accountMap.get(t.accSenderId.toString()) as any;
      const receiverAcc = accountMap.get(t.accRecieverId.toString()) as any;

      const transactionObj = t.toObject();

      const formattedTransaction = {
        _id: transactionObj._id,
        status: transactionObj.status,
        type: transactionObj.type,
        amount: transactionObj.amount,
        createdAt: transactionObj.createdAt,
        sender: userMap.get(senderAcc?.userId?.toString() || ''),
        reciever: userMap.get(receiverAcc?.userId?.toString() || ''),
      };

      return formattedTransaction;
    });

    return {
      message: 'done',
      data: result,
      status: true,
    };
  }

  async receiveMoney(senderAcc: any, recAcc: any, amount: number) {
    return await this.transactionModel.create({
      accSenderId: senderAcc,
      accRecieverId: recAcc,
      amount,
      status: TransactionStatus.PENDING,
      type: TransactionType.RECIEVE,
    });
  }

  async confirmReceive(
    senderAccount: any,
    receiverAccount: any,
    transaction: transactionType,
  ) {
    senderAccount.Balance -= transaction.amount;
    await senderAccount.save();

    receiverAccount.Balance += transaction.amount;
    await receiverAccount.save();

    transaction.status = TransactionStatus.SUCCESS;
    transaction.accSenderId = senderAccount._id;
    await transaction.save();
  }

  async rejectReceive(sender: any, transaction: transactionType) {
    const senderAcc = transaction.accSenderId as any;
    if (senderAcc.userId.toString() !== sender._id.toString()) {
      throw new ForbiddenException("You aren't the sender of this transaction");
    }

    transaction.status = TransactionStatus.FAILED;
    await transaction.save();

    return {
      message: 'done',
      status: true,
    };
  }

  checkTransactionStatus(transaction: transactionType) {
    if (transaction.status != TransactionStatus.PENDING) {
      throw new BadRequestException('This transaction was closed');
    }
  }

  async checkTransactionOwner(transaction: transactionType, sender: any) {
    const transactionSenderAcc = (await transaction.populate('accSenderId'))
      .accSenderId as any;

    if (transactionSenderAcc.userId.toString() != sender._id.toString()) {
      throw new ForbiddenException("You aren't the sender of this transaction");
    }
  }

  async getAllTransacions() {
    return await this.transactionModel.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: 'accSenderId',
          foreignField: '_id',
          as: 'accSenderId',
        },
      },
      { $unwind: '$accSenderId' },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'accSenderId.userId',
          as: 'sender',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                userName: { $concat: ['$firstName', ' ', '$lastName'] },
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'accRecieverId',
          foreignField: '_id',
          as: 'accRecieverId',
        },
      },
      { $unwind: '$accRecieverId' },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'accRecieverId.userId',
          as: 'reciever',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                userName: { $concat: ['$firstName', ' ', '$lastName'] },
                _id: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$sender' },
      { $unwind: '$reciever' },
      {
        $project: {
          accSenderId: 0,
          accRecieverId: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  async suspiciousTransaction(transactionId: Types.ObjectId) {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate({
        path: 'accSenderId',
        populate: {
          path: 'userId',
        },
      })
      .populate({
        path: 'accRecieverId',
        populate: {
          path: 'userId',
        },
      });

    if (!transaction) throw new NotFoundException('invalid transaction id');
    if (transaction.status == TransactionStatus.SUSPICIOUS)
      throw new BadRequestException('tansaction already reported before');
    const senderAccount = transaction.accSenderId as any;
    const sender = senderAccount.userId as any;

    const recieverAccount = transaction.accRecieverId as any;
    const reciever = recieverAccount.userId as any;

    await this.mailService.sendEmail({
      to: sender.email,
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
            <p><span class="info">Send to:</span> ${reciever.email}</p>
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
      message: 'Waiting for admin to aprove',
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
    senderAcc: any,
    recieverAcc: any,
  ) {
    senderAcc.Balance += transaction.amount;
    await senderAcc.save();

    recieverAcc.Balance -= transaction.amount;
    await recieverAcc.save();

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
