import { BaseCompanyResponseWhiteList } from '../../../company/dto/response/company.response.dto';
import { Exclude } from 'class-transformer';

class ClientsCompanyBaseWhiteList extends BaseCompanyResponseWhiteList {
  constructor(partial: Partial<ClientsCompanyBaseWhiteList>) {
    super(partial);
    Object.assign(this, partial);
  }
}
@Exclude()
export class ClientsCompanyResponseDto extends ClientsCompanyBaseWhiteList {
  constructor(partial: Partial<ClientsCompanyResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
