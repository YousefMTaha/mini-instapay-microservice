import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('mail-service')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendEmail(@Body() body: any) {
    return this.appService.sendEmail(body);
  }
}
