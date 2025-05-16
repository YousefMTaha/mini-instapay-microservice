import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class GetManyAccountsDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
} 