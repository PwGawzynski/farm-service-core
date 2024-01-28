import { Exclude, Expose } from 'class-transformer';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';

export class BaseCompanyResponseWhiteList {
  constructor(partial: Partial<BaseCompanyResponseWhiteList>) {
    Object.assign(this, partial);
  }
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  NIP: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  address: AddressResponseDto;
}

@Exclude()
export class CompanyResponseDto extends BaseCompanyResponseWhiteList {
  constructor(partial: Partial<CompanyResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
