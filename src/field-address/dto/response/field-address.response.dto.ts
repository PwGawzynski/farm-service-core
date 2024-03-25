import { Exclude, Expose } from 'class-transformer';

export class FieldAddressResponseWhiteList {
  @Expose()
  city: string;
  @Expose()
  county: string;
  @Expose()
  voivodeship: string;
  /*@Expose()
  postalCode: string;*/
  @Expose()
  longitude: string;
  @Expose()
  latitude: string;
  constructor(partial: Partial<FieldAddressResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class FieldAddressResponseDto extends FieldAddressResponseWhiteList {
  constructor(partial: Partial<FieldAddressResponseWhiteList>) {
    console.log(partial);
    super(partial);
    Object.assign(this, partial);
  }
}
