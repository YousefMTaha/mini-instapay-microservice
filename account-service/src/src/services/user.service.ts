import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { userType } from '../schemas/user.schema';

@Injectable()
export class UserService {
  private baseUrl = 'http://user-service:3001/user';
  constructor(private readonly httpService: HttpService) {}

  async updateUser(user: userType) {
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.baseUrl}/updateUserMicroservice`, user).pipe(
        catchError((error) => {
          const errorMessage = error.response?.data?.message || error.message;
          throw new BadRequestException(errorMessage);
        }),
      ),
    );
    return data;
  }
}
