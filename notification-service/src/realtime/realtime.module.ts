import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [],
  providers: [RealtimeGateway,UserService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
