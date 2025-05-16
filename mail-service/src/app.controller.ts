import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailPayloadDTO } from './dto/email-payload.dto';

@Controller('mail-service')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendEmail(@Body() body: EmailPayloadDTO) {
    return this.appService.sendEmail(body);
  }
}
