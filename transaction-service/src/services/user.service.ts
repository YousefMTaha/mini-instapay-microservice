import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { userType } from './user.types';
import { Types } from 'mongoose';

interface findUserDTO {
  id?: Types.ObjectId;
  email?: string;
  data?: string;
}
@Injectable()
export class UserService {
  private baseUrl = 'http://user-service:3001/user';
  constructor(private readonly httpService: HttpService) {}
  async findUser(data: findUserDTO) {
    const { data: user } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/findUser`, data).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    console.log({ user: user });

    return user;
  }
  async getAllAdmins() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/getAllAdmins`).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }

  async updateUser(userData: Partial<userType>) {
    const { data } = await firstValueFrom(
      this.httpService
        .put(`${this.baseUrl}/updateUserMicroservice`, userData)
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );
    return data;
  }

  async getManyUsers(ids: string[]) {
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
}
