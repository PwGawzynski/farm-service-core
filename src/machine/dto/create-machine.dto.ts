import { IsString, Length } from 'class-validator';
import { MachineConstants } from '../../../FarmServiceApiTypes/Machine/Constants';

export class CreateMachineDto {
  @IsString({ message: 'Machine name must be a string' })
  @Length(MachineConstants.NAME_MIN_LEN, MachineConstants.NAME_MAX_LEN, {
    message: 'Machine name must be from 1 to 100 characters length',
  })
  name: string;

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
