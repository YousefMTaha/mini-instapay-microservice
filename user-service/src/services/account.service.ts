import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AccountService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl = 'http://account-service:3004';

  async getCard(cardId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/card/getCardById`, { cardId })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }

  async getAccount(accountId: Types.ObjectId) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/account/getAccount`, { accountId })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }

  async getBank(bankId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/bank/getBankById`, { bankId })
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
