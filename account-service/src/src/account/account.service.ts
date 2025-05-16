import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hashSync, compareSync } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { customAlphabet } from 'nanoid';
import { UpdateLimitDTO } from './dto/update-amount.dto';
import { Account, accountType } from '../schemas/account.schema';
import { cardType } from '../schemas/card.schema';
import { TransactionService } from '../transaction/transaction.service';
import { NotificationService } from '../notification/notification.service';
import {
  EAccountType,
  authTypes,
  authForOptions,
  accountErrMsg,
} from 'src/utils/Constants/system.constants';
import { MailService } from 'src/utils/email.service';
import { ONE_WEEK_MILLI, limitType, ONE_DAY_MILLI } from 'src/account.constant';
import { checkForSendOTPDuration } from 'src/utils/common/common.methods';
import { User } from '../schemas/user.schema';
import { userType } from '../schemas/user.schema';
import { AddAccountDTO } from './dto/add-account.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';
import { UserService } from '../services/user.service';
@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private readonly _accountModel: Model<Account>,
    private readonly transactionService: TransactionService,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
  ) {}

  async getAllAccounts(user: userType) {
    const accounts = await this._accountModel
      .find({ userId: user._id, _id: { $ne: user.defaultAcc } })
      .populate('cardId', 'cardNo')
      .populate('bankId')
      .select('bankId userId');

    if (!accounts.length) throw new NotFoundException('No account exists');

    console.log(accounts);

    const data = accounts.map((ele) => {
      return {
        //@ts-ignore
        ...ele._doc,
        //@ts-ignore
        cardNo: ele._doc.cardId?.cardNo.substring(ele.cardId.cardNo.length - 4),
        cardId: undefined,
      };
    });

    return {
      message: 'done',
      status: true,
      data,
    };
  }

  async addAccount(body: AddAccountDTO, user: userType, card: cardType) {
    const account = await this._accountModel.create({
      bankId: body.bankId,
      cardId: card._id,
      userId: user._id,
      PIN: hashSync(body.PIN.toString(), 9),
      // default: user.defaultAcc ? false : true,
    });

    if (!user.defaultAcc) {
      user.defaultAcc = account._id;
      await this.userService.updateUser(user);
    }

    return {
      message: 'Account Created',
      status: true,
    };
  }

  async updatePIN(body: { newPIN: string }, account: accountType) {
    account.PIN = hashSync(body.newPIN, 10);
    await account.save();

    return {
      message: 'PIN updated',
      status: true,
    };
  }

  async deleteAccount(user: userType, account: accountType) {
    await account.deleteOne();

    if (user.defaultAcc.toString() == account._id.toString()) {
      user.defaultAcc = undefined;
      await this.userService.updateUser(user);
    }
    return {
      message: 'account deleted',
      status: true,
    };
  }

  async checkPIN(user: userType, account: accountType, PIN: string) {
    if (account.wrongPIN == 4) {
      await this.notificationService.wrongPIN(account);
    }

    await this.transactionService.checkNoOfTries(account, user);
    if (!compareSync(PIN, account.PIN)) {
      await this._accountModel.updateOne(
        { _id: account._id },
        { $inc: { wrongPIN: 1 } },
      );
      throw new BadRequestException('invalid PIN');
    }
  }

  async getAccount(id: Types.ObjectId): Promise<accountType> {
    const account = await this._accountModel.findById(id);
    if (!account) throw new NotFoundException('account not found');

    return account;
  }

  async checkUserAccount(
    userId: string,
    errorMsg: string,
  ): Promise<accountType> {
    const account = await this._accountModel.findOne({ userId });
    if (!account) throw new NotFoundException(accountErrMsg(errorMsg));
    return account;
  }

  async checkDefaultAcc(
    user: userType,
    errorMsg: string,
  ): Promise<accountType> {
    if (!user.defaultAcc) throw new NotFoundException(accountErrMsg(errorMsg));
    
    const account = await this._accountModel.findById(user.defaultAcc);
    console.log(user.defaultAcc);
    console.log({accounts:account});
    
    return account;
  }

  async getAccountById(
    userId: Types.ObjectId,
    accountId: Types.ObjectId,
    errorMsg: string,
  ) {
    const account = await this._accountModel.findOne({
      userId: userId,
      _id: accountId,
    });
    if (!account) throw new NotFoundException(accountErrMsg(errorMsg));
    return account;
  }

  async getDefault(user: userType) {
    if (!user.defaultAcc)
      throw new NotFoundException(`No default acc yet, Add one account`);
    const data = await user.populate('defaultAcc', ' bankId cardId');

    return data;
  }

  async resetTries(token: string) {
    const { accountId } = this.JwtService.verify(token, {
      secret: this.configService.get<string>('EXCEED_TRYS'),
    });

    const account = await this._accountModel.findByIdAndUpdate(accountId, {
      wrongPIN: 0,
    });
    if (!account) throw new NotFoundException('Invalid account');

    return {
      message: 'done',
      status: true,
    };
  }

  async checkLimit(amount: number, account: accountType) {
    const remainLimit = account.limit.amount - account.limit.spent;
    if (remainLimit < amount) {
      await this.notificationService.exceedLimit(
        amount,
        account.userId as Types.ObjectId,
      );

      throw new BadRequestException(
        `You will exceed the ${account.limit.type} limit. You only have ${remainLimit} EGP to spend`,
      );
    }
  }

  async updateLimit(account: accountType, body: UpdateLimitDTO) {
    const { amount, type } = body;

    const endDate =
      type == limitType.DAILY
        ? Date.now() + ONE_DAY_MILLI
        : Date.now() + ONE_WEEK_MILLI;

    await account.updateOne({
      'limit.amount': amount,
      'limit.spent': 0,
      'limit.type': type,
      'limit.endDate': endDate,
    });

    return {
      message: 'Updated',
      status: true,
    };
  }

  async forgetOTPMail(user: userType, account: accountType) {
    const generateOTP = customAlphabet('0123456789', 6);

    const OTP = generateOTP();

    const authItem = user.authTypes.find(
      (ele) =>
        ele.authFor == authForOptions.FORGET_PIN && ele.type === authTypes.CODE,
    );

    if (!authItem) {
      user.authTypes.push({
        type: authTypes.CODE,
        authFor: authForOptions.FORGET_PIN,
        value: hashSync(OTP, 9),
        expireAt: new Date().setMinutes(
          new Date().getMinutes() + 10,
        ) as unknown as Date,
      });
    } else {
      checkForSendOTPDuration(authItem.expireAt);
      authItem.value = hashSync(OTP, 9);
      authItem.expireAt = new Date().setMinutes(
        new Date().getMinutes() + 10,
      ) as unknown as Date;
    }

    await this.mailService.sendEmail({
      to: user.email,
      subject: 'Forget PIN',
      html: `
                <h1> This is your OTP for Forget PIN, The OTP valid for 10 mintues</h1>
                <h2> ${OTP} </h2>
                `,
    });

    return {
      message: 'OTP sent to your mail',
      status: true,
    };
  }

  async confirmOTPForgetPIN(token: string, user: userType, otp: string) {
    const foundAuthType = user.authTypes.find(
      (ele) =>
        ele.authFor == authForOptions.FORGET_PIN && ele.type === authTypes.CODE,
    );

    if (!foundAuthType) {
      throw new BadRequestException('Invalid request, send OTP first');
    }

    if (foundAuthType.expireAt < new Date()) {
      throw new BadRequestException('OTP expired request new one');
    }

    if (!compareSync(otp, foundAuthType.value)) {
      throw new BadRequestException('Invalid OTP');
    }

    const forgetToken = this.JwtService.sign(
      {},
      {
        secret: this.configService.get<string>('FORGET_PIN_TOKEN'),
        expiresIn: '10m',
      },
    );

    return {
      message: 'valid OTP',
      status: true,
      data: { token: forgetToken },
    };
  }

  async forgetPIN(user: userType, token: string, PIN: string) {
    try {
      this.JwtService.verify(token, {
        secret: this.configService.get<string>('FORGET_PIN_TOKEN'),
      });

      const account = await this._accountModel.findOne({
        userId: user._id,
      });

      if (!account) throw new NotFoundException('account not found');

      account.PIN = hashSync(PIN, 9);
      await account.save();

      return {
        message: 'PIN Updated successfully',
        status: true,
      };
    } catch (error) {
      throw new BadRequestException('Invalid token or expired');
    }
  }

  async updateAccount(body: UpdateAccountDTO) {
    return this._accountModel.findByIdAndUpdate(body._id, body);
  }

  async getManyAccounts(ids: string[]) {
    return this._accountModel.find({ _id: { $in: ids } });
  }

  async getUserAccounts(userId: Types.ObjectId) {
    return this._accountModel.find({ userId });
  }
}
