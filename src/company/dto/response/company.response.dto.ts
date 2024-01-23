import { Exclude, Expose } from 'class-transformer';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';

class CompanyResponseWhiteList {
  constructor(partial: Partial<CompanyResponseWhiteList>) {
    Object.assign(this, partial);
  }
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  NIP: string;
  @Expose()
  PhoneNumber: string;
  @Expose()
  address: AddressResponseDto;
}

@Exclude()
export class CompanyResponseDto extends CompanyResponseWhiteList {
  constructor(partial: Partial<CompanyResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
