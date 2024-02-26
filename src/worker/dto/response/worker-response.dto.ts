import { Exclude, Expose } from 'class-transformer';
import { PersonalDataResponseDto } from '../../../personal-data/dto/response/personalData-response.dto';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';
import { Position, Status } from '../../../../FarmServiceApiTypes/Worker/Enums';
import { UserResponseDto } from '../../../user/dto/response/user-response.dto';

export class WorkerResponseWhiteList {
  constructor(partial: Partial<WorkerResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  personalData: PersonalDataResponseDto;

  @Expose()
  address: AddressResponseDto;

  @Expose()
  position?: Position;

  @Expose()
  status?: Status;

  @Expose()
  email: string;
}

@Exclude()
export class WorkerResponseDto extends WorkerResponseWhiteList {
  constructor(partial: Partial<WorkerResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

@Exclude()
export class WorkerInfoDto {
  constructor(partial: Partial<WorkerInfoDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  assigned: boolean;

  @Expose()
  user: UserResponseDto;
}
