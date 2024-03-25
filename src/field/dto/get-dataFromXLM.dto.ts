import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GetDataFromXLMDto {
  @IsString({ message: 'Polish system id must be a string' })
  @Length(1, 10000)
  @IsNotEmpty({ message: 'Polish system id must be not empty strings' })
  data: string;
}
