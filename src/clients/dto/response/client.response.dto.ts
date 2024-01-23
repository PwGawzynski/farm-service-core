import { Exclude, Expose } from 'class-transformer';
import { UserResponseDto } from '../../../user/dto/response/user-response.dto';
import { ClientsCompanyResponseDto } from '../../../clients_company/dto/response/clients_company.response';

class ClientResponseWhiteList {
  constructor(partial: Partial<ClientsResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  user: UserResponseDto;
  @Expose()
  company: ClientsCompanyResponseDto;
}
@Exclude()
export class ClientsResponseDto extends ClientResponseWhiteList {
  constructor(partial: Partial<ClientsResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
