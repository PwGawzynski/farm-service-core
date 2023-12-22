import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  ValidateNested,
} from 'class-validator';
import { UserRole } from '../../../FarmServiceApiTypes/User/Enums';
import { CreatePersonalDataDto } from '../../personal-data/dto/create-personal-data.dto';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

/**
 * DTO used to specify JSON data body, and validate its payload, when Create user ask
 */
export class CreateUserDto {
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

  @IsDefined()
  @ValidateNested()
  @Type(() => CreatePersonalDataDto)
  personal_data: CreatePersonalDataDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  *[Symbol.iterator]() {
    yield this.email;
    yield this.role;
    yield this.password;
  }
}
