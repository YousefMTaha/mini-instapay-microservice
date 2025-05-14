import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UnHandledExceptions } from './filters/unhandeldErrors.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnHandledExceptions());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3003);
}
bootstrap();
