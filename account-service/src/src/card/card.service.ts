import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hashSync } from 'bcryptjs';
import { Card } from '../schemas/card.schema';
import { AddCardDTO } from './dto/add-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
  ) {}

  async addCard(cardData: AddCardDTO) {
    const card = await this.cardModel.create({
      holderName: cardData.holderName,
      cardNo: cardData.cardNo,
      date: {
        year: cardData.date.year,
        month: cardData.date.month
      },
      CVV: hashSync(cardData.CVV, 9),
    });

    return {
      message: 'created',
      status: true,
      data: card,
    };
  }

  async checkCardExist(cardNo: string): Promise<void> {
    const card = await this.cardModel.findOne({ cardNo });
    if (card) {
      throw new ConflictException('cardNo already linked with account');
    }
  }

  async getCard(cardId: string | Types.ObjectId) {
    const card = await this.cardModel.findById(cardId);
    return card;
  }
}
