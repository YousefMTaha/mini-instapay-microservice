import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HttpService } from '@nestjs/axios';

@Module({
  controllers: [UserController],
  providers: [UserService, HttpService],
})
export class UserModule {}
