import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  private baseUrl = 'http://user-service:3001/user';
  constructor(private readonly httpService: HttpService) {}
  async findUser(data) {
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

  async updateUser(userData) {
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
