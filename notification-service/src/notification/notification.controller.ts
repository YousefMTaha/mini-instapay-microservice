import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { currentUser } from 'src/decorators/current-user.decortaor';
import { SharedAuthGuard } from 'src/guards/auth.guard';
import { ObjectIdDTO } from 'src/common/common.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @UseGuards(SharedAuthGuard)
  @Get()
  getAll(@currentUser() user: any) {
    return this.notificationService.getAllNotfications(user._id);
  }

  @UseGuards(SharedAuthGuard)
  @Patch('markAsRead/:id')
  async markAsRead(@currentUser() user: any, @Param() param: ObjectIdDTO) {
    const notification = await this.notificationService.findById(
      user,
      param.id,
    );
    return this.notificationService.markAsRead(notification);
  }

  // internal - network (docker)
  @Post('exceedLimit')
  exceedLimit(@Body() body: any) {
    return this.notificationService.exceedLimit(body.amount, body.userId);
  }
  @Post('wrongPIN')
  wrongPIN(@Body() body: any) {
    return this.notificationService.wrongPIN(body.account);
  }

  @Post('receiveRequest')
  receiveRequest(@Body() body: any) {
    return this.notificationService.recieveRequest(
      body.sender,
      body.receiver,
      body.transactionId,
      body.amount,
    );
  }
  @Post('lowBalance')
  lowBalance(@Body() body: any) {
    return this.notificationService.lowBalance(body.cardNo, body.userId);
  }
  @Post('sendOrReceive')
  sendOrReceive(@Body() body: any) {
    return this.notificationService.sendOrRecieve(
      body.sender,
      body.receiver,
      body.transactionId,
      body.amount,
    );
  }
  @Post('rejectSend')
  rejectSend(@Body() body: any) {
    return this.notificationService.rejectSend(
      body.email,
      body.accReceiverId,
      body.transactionId,
    );
  }
  @Post('requestRefund')
  requestRefund(@Body() body: any) {
    return this.notificationService.requestRefund(
      body.user,
      body.transaction,
      body.reason,
      body.admins,
    );
  }
  @Post('approveRefund')
  approveRefund(@Body() body: any) {
    return this.notificationService.approveRefund(
      body.transaction,
      body.sender,
      body.receiver,
    );
  }
  @Post('rejectRefund')
  rejectRefund(@Body() body: any) {
    return this.notificationService.rejectRefund(
      body.transaction,
      body.sender,
      body.receiver,
    );
  }
}
