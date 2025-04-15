import { IsNotEmpty, IsUrl } from 'class-validator';

export class GetNewDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
