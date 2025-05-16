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
import { User } from '../user.types';
import { ExceedLimitDTO } from './dto/exceed-limit.dto';
import { WrongPinDTO } from './dto/wrong-pin.dto';
import { ReceiveRequestDTO } from './dto/receive-request.dto';
import { LowBalanceDTO } from './dto/low-balance.dto';
import { SendOrReceiveDTO } from './dto/send-or-receive.dto';
import { RejectSendDTO } from './dto/reject-send.dto';
import { RequestRefundDTO } from './dto/request-refund.dto';
import { ApproveRefundDTO } from './dto/approve-refund.dto';
import { RejectRefundDTO } from './dto/reject-refund.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @UseGuards(SharedAuthGuard)
  @Get()
  getAll(@currentUser() user: User) {
    return this.notificationService.getAllNotifications(user._id);
  }

  @UseGuards(SharedAuthGuard)
  @Patch('markAsRead/:id')
  async markAsRead(@currentUser() user: User, @Param() param: ObjectIdDTO) {
    const notification = await this.notificationService.findById(
      user,
      param.id,
    );
    return this.notificationService.markAsRead(notification);
  }

  // internal - network (docker)
  @Post('exceedLimit')
  exceedLimit(@Body() body: ExceedLimitDTO) {
    return this.notificationService.exceedLimit(body.amount, body.userId);
  }
  @Post('wrongPIN')
  wrongPIN(@Body() body: WrongPinDTO) {
    return this.notificationService.wrongPIN(body.account);
  }

  @Post('receiveRequest')
  receiveRequest(@Body() body: ReceiveRequestDTO) {
    return this.notificationService.receiveRequest(
      body.sender,
      body.receiver,
      body.transactionId,
      body.amount,
    );
  }
  @Post('lowBalance')
  lowBalance(@Body() body: LowBalanceDTO) {
    return this.notificationService.lowBalance(body.cardNo, body.userId);
  }
  @Post('sendOrReceive')
  sendOrReceive(@Body() body: SendOrReceiveDTO) {
    return this.notificationService.sendOrReceive(
      body.sender,
      body.receiver,
      body.transactionId,
      body.amount,
    );
  }
  @Post('rejectSend')
  rejectSend(@Body() body: RejectSendDTO) {
    return this.notificationService.rejectSend(
      body.email,
      body.receiverId,
      body.transactionId,
    );
  }
  @Post('requestRefund')
  requestRefund(@Body() body: RequestRefundDTO) {
    return this.notificationService.requestRefund(
      body.user,
      body.transaction,
      body.reason,
      body.admins,
    );
  }
  @Post('approveRefund')
  approveRefund(@Body() body: ApproveRefundDTO) {
    return this.notificationService.approveRefund(
      body.transaction,
      body.sender,
      body.receiver,
    );
  }
  @Post('rejectRefund')
  rejectRefund(@Body() body: RejectRefundDTO) {
    return this.notificationService.rejectRefund(
      body.transaction,
      body.sender,
      body.receiver,
    );
  }
}
