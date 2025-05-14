import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import cardModel from '../schemas/card.schema';
import { CardController } from './card.controller';
@Module({
  providers: [CardService],
  controllers: [CardController],
  imports: [cardModel],
})
export class CardModule {}
