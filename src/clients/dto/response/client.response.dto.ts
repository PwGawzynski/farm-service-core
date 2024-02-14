import { Exclude, Expose } from 'class-transformer';
import { UserResponseDto } from '../../../user/dto/response/user-response.dto';
import { ClientsCompanyResponseDto } from '../../../clients_company/dto/response/clients_company.response';

class ClientResponseWhiteList {
  constructor(partial: Partial<ClientsResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  user: UserResponseDto;
  @Expose()
  company?: ClientsCompanyResponseDto;
}
@Exclude()
export class ClientsResponseDto extends ClientResponseWhiteList {
  constructor(partial: ClientsResponseDto) {
    super(partial);
    Object.assign(this, partial);
  }
}
