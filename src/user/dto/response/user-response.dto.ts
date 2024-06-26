import { UserRole } from '../../../../FarmServiceApiTypes/User/Enums';
import { Exclude, Expose } from 'class-transformer';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';
import { PersonalDataResponseDto } from '../../../personal-data/dto/response/personalData-response.dto';
import { AccountResponseDto } from './account.response';
import { CompanyResponseDto } from '../../../company/dto/response/company.response.dto';

export class UserResponseWhiteListDto {
  constructor(partial: Partial<UserResponseWhiteListDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  role: UserRole;
  @Expose()
  personalData: PersonalDataResponseDto;
  @Expose()
  address: AddressResponseDto;
  @Expose()
  account: AccountResponseDto;
  @Expose()
  company?: CompanyResponseDto;
}

@Exclude()
export class UserResponseDto extends UserResponseWhiteListDto {
  constructor(partial: Partial<UserResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  @Exclude()
  id: string;
}
