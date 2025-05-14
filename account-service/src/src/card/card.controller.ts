import { Controller, Body, Post } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('getCardById')
  getCardById(@Body() body: any) {
    return this.cardService.getCard(body.cardId);
  }
}
