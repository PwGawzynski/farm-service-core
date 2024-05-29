import { Theme } from '../../../FarmServiceApiTypes/Account/Constants';
import { IsEnum } from 'class-validator';

export class UpdateAccountSettingsDto {
  constructor(props: Partial<UpdateAccountSettingsDto>) {
    if (props) Object.assign(this, props);
  }

  @IsEnum(Theme)
  theme: Theme;

  *[Symbol.iterator]() {
    yield this.theme;
  }
}
