import { IsArray, IsString } from 'class-validator';

export class GetManyAccountsRequestDTO {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
} 