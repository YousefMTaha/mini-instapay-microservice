import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  private transporter = nodemailer.createTransport({
    service: this.configService.get<string>('MAIL_SERVICE'),
    auth: {
      user: this.configService.get<string>('MAIL_USER_NAME'),
      pass: this.configService.get<string>('MAIL_PASSWORD'),
    },
  });

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    let info = await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      html,
    });

    

    return info.rejected.length ? false : true;
  }
}
