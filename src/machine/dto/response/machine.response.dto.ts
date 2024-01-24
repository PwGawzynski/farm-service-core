import { Exclude, Expose } from 'class-transformer';

export class MachineResponseWhiteList {
  constructor(partial: Partial<MachineResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  licensePlate: string;
}

@Exclude()
export class MachineResponseDto extends MachineResponseWhiteList {
  constructor(partial: Partial<MachineResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
