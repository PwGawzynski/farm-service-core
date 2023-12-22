import { Exclude, Expose } from 'class-transformer';

export class AddressWhiteList {
  constructor(partial: Partial<AddressResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  city: string;

  @Expose()
  county: string;

  @Expose()
  voivodeship?: string;

  @Expose()
  street?: string;

  @Expose()
  houseNumber: string;

  @Expose()
  apartmentNumber?: string;

  @Expose()
  postalCode: string;
}

@Exclude()
export class AddressResponseDto extends AddressWhiteList {
  constructor(partial: Partial<AddressResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
