import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import notificationModel from 'src/notification.schema';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [notificationModel],
})
export class NotificationModule {}
