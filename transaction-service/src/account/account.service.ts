import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AccountService {
  private baseUrl = 'http://account-service:3004/account';
  constructor(private readonly httpService: HttpService) {}
  async getAccountById(userId, accountId, errMsg) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/getAccountById`, { userId, accountId, errMsg })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async checkDefaultAcc(user, errMsg) {
    console.log({ userCheckDefaultAcc: user });

    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/checkDefaultAcc`, { user, errMsg })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async checkPIN(user, account, pin) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/checkPIN`, { user, account, pin })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async checkLimit(amount, account) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/checkLimit`, { amount, account })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }
  async getAccount(accountId) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/getAccount`, { accountId }).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }
  async updateAccount(body: any) {
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.baseUrl}/updateAccount`, body).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async getManyAccounts(ids: string[]) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/many-by-ids`, { ids }).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async getUserAccounts(userId: string) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/user-accounts`, { userId }).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }
}
