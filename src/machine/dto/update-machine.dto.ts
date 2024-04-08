import { Machine } from '../entities/machine.entity';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { IsOptional, IsString, Length } from 'class-validator';
import { MachineConstants } from '../../../FarmServiceApiTypes/Machine/Constants';

export class UpdateMachineDto {
  @FindOrReject(Machine, { message: 'Machine not found' })
  machine: Machine;

  @IsOptional()
  @IsString({ message: 'Machine name must be a string' })
  @Length(MachineConstants.NAME_MIN_LEN, MachineConstants.NAME_MAX_LEN, {
    message: 'Machine name must be from 1 to 100 characters length',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'license plate must be a string' })
  @Length(
    MachineConstants.LICENCE_PLATE_MIN_LEN,
    MachineConstants.LICENCE_PLATE_MAX_LEN,
    {
      message: 'License plate must be from 1 to 20 characters length',
    },
  )
  licensePlate: string;
}
