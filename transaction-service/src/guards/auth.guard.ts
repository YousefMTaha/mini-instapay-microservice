import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class SharedAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.get<boolean>('skipAuth', context.getHandler()))
      return true;

    const request = context.switchToHttp().getRequest();

    const { token } = request.headers;

    if (!token) throw new BadRequestException('login first');

    const { _id } = this.jwtService.verify(token, {
      secret: this.configService.get<string>('TOKEN_LOGIN'),
    });

    const { data: user } = await firstValueFrom(
      this.httpService
        .post('http://user-service:3001/user/userDataGuard', {
          _id,
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response?.data?.message || error.message;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );

    if (!user) throw new NotFoundException('user not found');

    if (user.status == 'Offline') {
      throw new UnauthorizedException('you need to login again');
    }

    if (user.status == 'Suspended') {
      throw new ForbiddenException(
        'Your account has been banned, please contact us',
      );
    }

    request.currentUser = user;

    return true;
  }
}
