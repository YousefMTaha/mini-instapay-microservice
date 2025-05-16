import { Controller, Body, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CardIdDTO } from './dto/card-id.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('getCardById')
  getCardById(@Body() body: CardIdDTO) {
    return this.cardService.getCard(body.cardId);
  }
}
