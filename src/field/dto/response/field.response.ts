import { Exclude, Expose } from 'class-transformer';
import { FieldAddressResponseDto } from '../../../field-address/dto/response/field-address.response.dto';

export class FieldResponseWhiteList {
  constructor(partial: Partial<FieldResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  polishSystemId: string;

  @Expose()
  area: number;

  @Expose()
  dateOfCollectionData: Date;

  @Expose()
  address: FieldAddressResponseDto;

  @Expose()
  nameLabel: string;
}

@Exclude()
export class FieldResponseDto extends FieldResponseWhiteList {
  constructor(partial: Partial<FieldResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
