import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccountModule } from './src/account/account.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from './src/middlewares/logger.middleware';
import { BankModule } from './src/bank/bank.module';

@Module({
  imports: [
    AccountModule,
    BankModule,
    HttpModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_Cloud_URl),
    JwtModule.register({ global: true }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
