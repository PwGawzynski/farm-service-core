import { Exclude, Expose } from 'class-transformer';

export class PersonalDataResponseWhiteList {
  constructor(partial: Partial<PersonalDataResponseWhiteList>) {
    Object.assign(this, partial);
  }
  @Expose()
  name: string;
  @Expose()
  surname: string;
  @Expose()
  phone_number: string;
}

@Exclude()
export class PersonalDataResponseDto extends PersonalDataResponseWhiteList {
  @Exclude()
  id: string;

  constructor(partial: Partial<PersonalDataResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
