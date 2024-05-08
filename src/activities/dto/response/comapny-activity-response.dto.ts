import { Exclude, Expose } from 'class-transformer';
import { ActivityType } from '../../../../FarmServiceApiTypes/Activity/Enums';
import { UserRole } from '../../../../FarmServiceApiTypes/User/Enums';

export class CompanyActivityResponseWhiteList {
  constructor(partial: Partial<CompanyActivityResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  sessionId: string;
  @Expose()
  fieldId: string;
  @Expose()
  taskId: string;
  @Expose()
  causerId: string;
  @Expose()
  causerShortcutData: {
    name: string;
    surname: string;
    role: UserRole;
  };
  @Expose()
  fieldShortcutData: {
    nameLabel: string;
  };
  type: ActivityType;
}

@Exclude()
export class CompanyActivityResponseDto extends CompanyActivityResponseWhiteList {
  constructor(partial: Partial<CompanyActivityResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
