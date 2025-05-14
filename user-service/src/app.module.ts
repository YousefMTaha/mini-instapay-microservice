import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'config/.env' }),
    MongooseModule.forRoot(process.env.DB_Cloud_URl),
    HttpModule.register({ global: true }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
