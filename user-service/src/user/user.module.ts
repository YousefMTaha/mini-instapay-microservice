import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailService } from 'src/services/email.service';
import { userModel } from 'src/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AccountService } from 'src/services/account.service';

@Module({
  controllers: [UserController],
  providers: [UserService, MailService, AccountService],
  imports: [AuthModule, userModel],
  exports: [UserService],
})
export class UserModule {}
