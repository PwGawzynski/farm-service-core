import { Exclude, Expose } from 'class-transformer';

export class AddressWhiteList {
  constructor(partial?: Partial<AddressResponseDto>) {
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
  @Exclude()
  id: string;
  constructor(partial?: Partial<AddressResponseDto>) {
    // due to on sse it's not work
    if (partial) partial.id = undefined;
    super(partial);
    Object.assign(this, partial);
  }
}
