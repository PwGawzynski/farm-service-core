import { IsString, Length } from 'class-validator';

export class CreateMachineDto {
  @IsString({ message: 'Machine name must be a string' })
  @Length(1, 100, {
    message: 'Machine name must be from 1 to 100 characters length',
  })
  name: string;

  @IsString({ message: 'license plate must be a string' })
  @Length(1, 20, {
    message: 'License plate must be from 1 to 20 characters length',
  })
  licensePlate: string;
}
