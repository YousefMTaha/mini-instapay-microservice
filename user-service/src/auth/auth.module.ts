import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { userModel } from 'src/user.schema';
import { MailService } from 'src/services/email.service';

@Module({
  imports: [userModel],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService, userModel],
})
export class AuthModule {}
