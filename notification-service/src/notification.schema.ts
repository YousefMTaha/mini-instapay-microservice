import { HttpModule, HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Document, Types } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { RealtimeModule } from './realtime/realtime.module';
import { ENotificationType } from './notification.constants';

@Schema({ versionKey: false, timestamps: { updatedAt: false } })
export class Notification {
  @Prop({ required: true })
  content: string;

  @Prop({ ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: ENotificationType, required: true })
  type: string;

  @Prop({ ref: 'Transaction' })
  transactionId?: Types.ObjectId;

  @Prop({ default: false })
  isRead: boolean;

  readonly _id: Types.ObjectId;
}

const notificationSchema = SchemaFactory.createForClass(Notification);

const notificationModel = MongooseModule.forFeatureAsync([
  {
    name: Notification.name,
    useFactory(notificationGateWay: RealtimeGateway, httpService: HttpService) {
      notificationSchema.post('save', async function () {
        const { data: user } = await firstValueFrom(
          httpService
            .post('http://user-service:3001/user/userDataGuard', {
              _id: this.userId,
            })
            .pipe(
              catchError((err: AxiosError) => {
                throw new BadRequestException(
                  'ERROR FROM USER GUARD SERVICE:' + err.message,
                );
              }),
            ),
        );
        if (user.socketId) {
          notificationGateWay.sendNotification(user.socketId, this);
        }
      });

      return notificationSchema;
    },
    inject: [RealtimeGateway, HttpService],
    imports: [RealtimeModule],
  },
]);

export type notificationType = Notification & Document;

export default notificationModel;
