import { IsString } from 'class-validator';

export class GetUserAccountsRequestDTO {
  @IsString()
  userId: string;
} 