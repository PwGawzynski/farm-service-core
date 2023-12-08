import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

/**
 * Used to specify data send in Update password ask and validate it
 */
export class UpdatePasswordDto {
  @IsString({
    message: 'Password must be string type',
  })
  @IsNotEmpty({
    message: 'Password can not be empty string',
  })
  @Length(1, 200, {
    message: 'Length must be in 1 to 200 characters',
  })
  oldPassword: string;

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
  newPassword: string;
}
