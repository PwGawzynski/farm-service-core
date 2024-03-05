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
  phoneNumber: string;
}

@Exclude()
export class PersonalDataResponseDto extends PersonalDataResponseWhiteList {
  @Exclude()
  id: string;
  constructor(partial: Partial<PersonalDataResponseDto>) {
    // due to sse causes exclude dont work
    if (partial) partial.id = undefined;
    super(partial);
    Object.assign(this, partial);
  }
}
