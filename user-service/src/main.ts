import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnHandledExceptions } from './filters/unhandeldErrors.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnHandledExceptions());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
