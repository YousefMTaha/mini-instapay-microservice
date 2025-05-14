import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class CardService {
  constructor(private readonly httpService: HttpService) {}

  private baseUrl = 'http://account-service:3004/card';

  async getCard(cardId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/getCardById`, {
          cardId,
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
}
