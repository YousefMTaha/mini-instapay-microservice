import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionStatus, TransactionType } from './transaction.constants';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { AccountService } from 'src/account/account.service';
import { AccountModule } from './account/account.module';
import { CardService } from './card/card.service';
import { CardModule } from './card/card.module';
@Schema({
  versionKey: false,
  timestamps: {
    updatedAt: false,
  },
})
export class Transaction {
  @Prop({ enum: TransactionStatus, default: TransactionStatus.SUCCESS })
  status: string;

  @Prop({ enum: TransactionType })
  type: string;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accSenderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accRecieverId: Types.ObjectId;

  readonly _id: Types.ObjectId;
  readonly createdAt?: Date;
}

const transactionSchema = SchemaFactory.createForClass(Transaction);

const transactionModel = MongooseModule.forFeatureAsync([
  {
    name: 'Transaction',
    useFactory(
      notificationService: NotificationService,
      accountService: AccountService,
      cardService: CardService,
    ) {
      transactionSchema.post('save', async function () {
        const senderAccount = await accountService.getAccount(this.accSenderId);
        if (senderAccount.Balance < 200) {
          const card = await cardService.getCard(senderAccount.cardId);
          await notificationService.lowBalance(
            card.cardNo,
            senderAccount.userId as Types.ObjectId,
          );
        }

        // await senderAccount.updateOne({ $inc: { 'limit.spent': this.amount } });
        senderAccount.limit.spent += this.amount;
        await accountService.updateAccount(senderAccount);
      });

      return transactionSchema;
    },
    inject: [NotificationService, AccountService, CardService],
    imports: [NotificationModule, AccountModule, CardModule],
  },
]);

export type transactionType = Transaction & Document;

export default transactionModel;
