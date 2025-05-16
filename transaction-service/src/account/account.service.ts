import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { accountType } from './account.types';
import { Types } from 'mongoose';
import {
  AccountIdRequestDTO,
  CheckLimitRequestDTO,
  CheckPinRequestDTO,
  DefaultAccRequestDTO,
  GetAccountRequestDTO,
  GetManyAccountsRequestDTO,
  GetUserAccountsRequestDTO,
} from './dto';

@Injectable()
export class AccountService {
  private baseUrl = 'http://account-service:3004/account';
  constructor(private readonly httpService: HttpService) {}

  async getAccountById(
    userId: Types.ObjectId,
    accountId: Types.ObjectId,
    errMsg: string,
  ): Promise<accountType> {
    const requestData: AccountIdRequestDTO = { userId, accountId, errMsg };
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/getAccountById`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async checkDefaultAcc(
    user: { _id: Types.ObjectId; defaultAcc: Types.ObjectId },
    errMsg: string,
  ): Promise<accountType> {
    const requestData: DefaultAccRequestDTO = {
      user: {
        _id: user._id.toString(),
        defaultAcc: user.defaultAcc?.toString(),
      },
      errMsg,
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}/checkDefaultAcc`, requestData)
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );

    console.log({ data });

    return data;
  }

  async checkPIN(
    user: { _id: Types.ObjectId },
    account: accountType,
    pin: string,
  ): Promise<void> {
    const requestData: CheckPinRequestDTO = {
      user: { _id: user._id.toString() },
      account,
      pin,
    };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/checkPIN`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async checkLimit(amount: number, account: accountType): Promise<void> {
    const requestData: CheckLimitRequestDTO = { amount, account };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/checkLimit`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async getAccount(accountId: Types.ObjectId): Promise<accountType> {
    const requestData: GetAccountRequestDTO = { accountId };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/getAccount`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async updateAccount(
    account: accountType,
  ): Promise<{ message: string; status: boolean }> {
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.baseUrl}/updateAccount`, account).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async getManyAccounts(ids: string[]): Promise<accountType[]> {
    const requestData: GetManyAccountsRequestDTO = { ids };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/many-by-ids`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async getUserAccounts(userId: string): Promise<accountType[]> {
    const requestData: GetUserAccountsRequestDTO = { userId };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/user-accounts`, requestData).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }
}
