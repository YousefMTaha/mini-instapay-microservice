import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ENotificationType, notificationMsg } from 'src/notification.constants';
import { notificationType, Notification } from 'src/notification.schema';
import { User } from 'src/user.types';
import { Account } from 'src/account.types';
import { Transaction } from 'src/transaction.types';

interface NotificationCreateData {
  amount?: number;
  email?: string;
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async create(data: NotificationCreateData) {
    const notification = await this.notificationModel.create({
      content: notificationMsg({
        amount: data.amount,
        destination: data.email,
      })[data.type],
      transactionId: data._id,
      type: data.type,
      userId: data.userId,
    });

    return {
      message: 'done',
      status: true,
      data: notification,
    };
  }

  async getAllNotifications(userId: Types.ObjectId) {
    const notifications = await this.notificationModel
      .find({ userId })
      .sort('-createdAt');

    return {
      message: 'done',
      status: true,
      data: notifications,
    };
  }

  async markAsRead(notification: notificationType) {
    await notification.updateOne({ isRead: true });
    return {
      message: 'done',
      status: true,
    };
  }

  async findById(user: User, notificationId: Types.ObjectId) {
    const notification = await this.notificationModel.findOne({
      userId: user._id,
      _id: notificationId,
    });

    if (!notification) throw new NotFoundException('No Notifications yet');
    return notification;
  }

  async sendOrReceive(
    sender: User,
    receiver: User,
    transactionId: Types.ObjectId,
    amount: number,
  ) {
    if (sender._id.toString() === receiver._id.toString()) {
      throw new BadRequestException("You can't send to your self");
    }
    // For sender
    await this.notificationModel.create({
      userId: sender._id,
      type: ENotificationType.SEND,
      content: notificationMsg({ amount, destination: receiver.email })['Send'],
      transactionId,
    });

    // For receiver
    await this.notificationModel.create({
      userId: receiver._id,
      type: ENotificationType.RECEIVE,
      content: notificationMsg({ amount, destination: sender.email })[
        'Received'
      ],
      transactionId,
    });

    return {
      message: 'Done, check you notification section',
      status: true,
    };
  }

  async receiveRequest(
    sender: User,
    receiver: User,
    transactionId: Types.ObjectId,
    amount: number,
  ) {
    // For sender
    await this.notificationModel.create({
      userId: sender._id,
      type: ENotificationType.REQUEST_SEND,
      content: notificationMsg({ amount, destination: receiver.email })[
        'requestSend'
      ],
      transactionId,
    });

    return {
      message: 'Request sended, waiting for sender approve',
      status: true,
    };
  }

  async rejectSend(
    senderEmail: string,
    receiverId: Types.ObjectId,
    transactionId: Types.ObjectId,
  ) {
    // For receiver
    await this.notificationModel.create({
      userId: receiverId,
      type: ENotificationType.REQUEST_SEND,
      content: notificationMsg({ destination: senderEmail })['rejectSend'],
      transactionId,
    });

    return {
      message: 'Done',
      status: true,
    };
  }

  async wrongPIN(account: Account) {
    await this.notificationModel.create({
      userId: account.userId,
      type: ENotificationType.WRONG_PIN,
      content: notificationMsg()['wrongPin'],
    });

    return {
      message: 'sended',
      status: true,
    };
  }

  async requestRefund(
    user: User,
    transaction: Transaction,
    reason: string,
    admins: User[],
  ) {
    for (const admin of admins) {
      await this.notificationModel.create({
        transactionId: transaction._id,
        content: `'${user.email}' request to refund transaction (${transaction._id}) with ${transaction.amount} EGP for this reason: ${reason}`,
        type: ENotificationType.REQUEST_REFUND,
        userId: admin._id,
      });
    }
  }

  async approveRefund(transaction: Transaction, sender: User, receiver: User) {
    await this.notificationModel.create({
      transactionId: transaction._id,
      content: `Your request to refund ${transaction.amount} EGP from ${receiver.email} approved by admin, check your balance`,
      type: ENotificationType.REQUEST_REFUND,
      userId: sender._id,
    });
    await this.notificationModel.create({
      transactionId: transaction._id,
      content: `The Received amount: ${transaction.amount} EGP that was from ${sender.email} was refunded by admin`,
      type: ENotificationType.REQUEST_REFUND,
      userId: receiver._id,
    });
  }

  async rejectRefund(
    transaction: Transaction,
    senderId: Types.ObjectId,
    receiver: User,
  ) {
    await this.notificationModel.create({
      transactionId: transaction._id,
      content: `Your request to refund ${transaction.amount} EGP from ${receiver.email} rejected by admin`,
      type: ENotificationType.REQUEST_REFUND,
      userId: senderId,
    });
  }

  async exceedLimit(amount: number, senderId: Types.ObjectId) {
    await this.notificationModel.create({
      content: `The last transaction with ${amount} EGP was failed because you will exceed the limit`,
      type: ENotificationType.EXCEED_LIMIT,
      userId: senderId,
    });
  }

  async lowBalance(cardNo: string, senderId: Types.ObjectId) {
    await this.notificationModel.create({
      content: `Your balance is almost reach the minimum limit! card (${cardNo.substring(
        cardNo.length - 4,
      )})`,
      type: ENotificationType.LOW_BALANCE,
      userId: senderId,
    });
  }
}
