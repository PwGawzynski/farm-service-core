import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { LoginUserConstants } from '../../../FarmServiceApiTypes/User/Constants';

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
  @Length(LoginUserConstants.EMAIL_MIN_LEN, LoginUserConstants.EMAIL_MAX_LEN, {
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
  @Length(
    LoginUserConstants.PASSWORD_MIN_LEN,
    LoginUserConstants.PASSWORD_MAX_LEN,
    {
      message: 'Length must be in 1 to 200 characters',
    },
  )
  @IsStrongPassword({
    minLength: LoginUserConstants.PASSWORD_MIN_LEN,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;
}
