import { BaseCompanyResponseWhiteList } from '../../../company/dto/response/company.response.dto';
import { Exclude, Expose } from 'class-transformer';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';

class ClientsCompanyBaseWhiteList extends BaseCompanyResponseWhiteList {
  constructor(partial: Partial<ClientsCompanyBaseWhiteList>) {
    super(partial);
    Object.assign(this, partial);
  }
  @Expose()
  id: string;
  @Expose()
  address: AddressResponseDto;
}
@Exclude()
export class ClientsCompanyResponseDto extends ClientsCompanyBaseWhiteList {
  constructor(partial: Partial<ClientsCompanyResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
