import { Exclude, Expose } from 'class-transformer';
import { Theme } from '../../../../FarmServiceApiTypes/Account/Constants';

export class AccountWhiteList {
  constructor(partial: Partial<AccountResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  theme?: Theme;
}

@Exclude()
export class AccountResponseDto extends AccountWhiteList {
  constructor(partial: Partial<AccountResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
