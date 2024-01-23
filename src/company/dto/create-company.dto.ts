import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from '../../address/dto/create-address.dto';
import { Type } from 'class-transformer';
import { CompanyConstants } from '../../../FarmServiceApiTypes/Company/Constants';
class CompanyValidationMessages {
  static readonly NAME_STRING = 'Name must be string type';
  static readonly NAME_NOT_EMPTY = 'Name cannot be an empty string';
  static readonly NAME_LENGTH = 'Length must be in 1 to 500 characters';
  static readonly EMAIL_STRING = 'Email must be string type';
  static readonly EMAIL_NOT_EMPTY = 'Email cannot be empty';
  static readonly EMAIL_LENGTH = 'Length must be in 1 to 350 characters';
  static readonly NIP_STRING = 'NIP must be string type';
  static readonly NIP_NOT_EMPTY = 'NIP cannot be an empty string';
  static readonly PHONE_STRING = 'Phone number must be string type';
  static readonly PHONE_LENGTH = 'Length must be in 1 to 20 characters';
}

export class CreateCompanyDto {
  @IsString({
    message: CompanyValidationMessages.NAME_STRING,
  })
  @IsNotEmpty({
    message: CompanyValidationMessages.NAME_NOT_EMPTY,
  })
  @Length(CompanyConstants.MIN_NAME_LENGTH, CompanyConstants.MAX_NAME_LENGTH, {
    message: CompanyValidationMessages.NAME_LENGTH,
  })
  name: string;

  @IsEmail()
  @IsNotEmpty({
    message: CompanyValidationMessages.EMAIL_NOT_EMPTY,
  })
  @Length(
    CompanyConstants.MIN_EMAIL_LENGTH,
    CompanyConstants.MAX_EMAIL_LENGTH,
    {
      message: CompanyValidationMessages.EMAIL_LENGTH,
    },
  )
  email: string;

  @IsString({
    message: CompanyValidationMessages.NIP_STRING,
  })
  @IsNotEmpty({
    message: CompanyValidationMessages.NIP_NOT_EMPTY,
  })
  @Length(
    CompanyConstants.MIN_NIP_LENGTH,
    undefined, // No max length for NIP
    {
      message: CompanyValidationMessages.NIP_NOT_EMPTY,
    },
  )
  NIP: string;

  @IsString({
    message: CompanyValidationMessages.PHONE_STRING,
  })
  @Length(
    CompanyConstants.MIN_PHONE_LENGTH,
    CompanyConstants.MAX_PHONE_LENGTH,
    {
      message: CompanyValidationMessages.PHONE_LENGTH,
    },
  )
  PhoneNumber: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  *[Symbol.iterator]() {
    yield this.name;
    yield this.email;
    yield this.NIP;
    yield this.PhoneNumber;
    yield this.address;
  }
}
