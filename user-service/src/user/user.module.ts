import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailService } from 'utils/email.service';
import { userModel } from 'src/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService, MailService],
  imports: [AuthModule, userModel],
  exports: [UserService],
})
export class UserModule {}
