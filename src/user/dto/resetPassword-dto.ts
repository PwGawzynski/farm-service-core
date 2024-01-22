import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString({
    message: 'Login must be string type',
  })
  @IsNotEmpty({
    message: 'Login can not be empty string',
  })
  @Length(1, 350, {
    message: 'Length must be in 1 to 350 characters',
  })
  @IsEmail()
  email: string;
}
