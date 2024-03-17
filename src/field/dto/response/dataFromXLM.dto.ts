import { Exclude, Expose } from 'class-transformer';

export class DataFromXLMResponseWhiteList {
  constructor(partial: Partial<DataFromXLMResponseWhiteList>) {
    Object.assign(this, partial);
  }

  @Expose()
  area: number;

  @Expose()
  city: string;

  @Expose()
  county: string;

  @Expose()
  dateOfCollectionData: Date;

  @Expose()
  polishSystemId: string;

  @Expose()
  voivodeship: string;
}

@Exclude()
export class DataFromXLMResponseDto extends DataFromXLMResponseWhiteList {
  constructor(partial: Partial<DataFromXLMResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
