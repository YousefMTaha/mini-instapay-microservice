import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnHandledExceptions } from './src/filters/unhandeldErrors.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnHandledExceptions());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3004);
}
bootstrap();
