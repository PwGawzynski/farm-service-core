import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

/**
 * Data transfer object, used to specify expected in request data object
 */
export class UserDataDto {
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

  @IsString({
    message: 'Password must be string type',
  })
  @IsNotEmpty({
    message: 'Password can not be empty string',
  })
  @Length(1, 200, {
    message: 'Length must be in 1 to 200 characters',
  })
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;
}
