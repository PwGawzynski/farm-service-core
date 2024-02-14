import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * This DTO contains information about userPersonalData entity properties types
 */
export class CreatePersonalDataDto {
  @IsString({
    message: 'User name must be string type',
  })
  @IsNotEmpty({
    message: 'User name cannot be empty string',
  })
  @Length(0, 70)
  name: string;

  @IsString({
    message: 'User surname must be string type',
  })
  @IsNotEmpty({
    message: 'User surname cannot be empty string',
  })
  @Length(0, 250)
  surname: string;

  @IsString({
    message: 'Apartment number must be string type',
  })
  @IsNotEmpty({
    message: 'Apartment number cannot be empty string',
  })
  @Length(0, 13)
  phoneNumber: string;

  *[Symbol.iterator]() {
    yield this.name;
    yield this.surname;
    yield this.phoneNumber;
  }
}
