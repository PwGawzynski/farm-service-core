import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import FieldAddressConstants from '../../../FarmServiceApiTypes/FiledAddress/Constants';

export class TaskSessionEntityDto {
  @IsString({ message: 'Longitude code must be a string type' })
  @Length(
    FieldAddressConstants.LONGITUDE_MIN_LEN,
    FieldAddressConstants.LONGITUDE_MAX_LEN,
  )
  @IsLongitude()
  @IsNotEmpty({ message: 'Longitude code cannot be empty' })
  onOpenWorkerLatitude: string;

  @IsString({ message: 'Latitude code must be a string type' })
  @Length(
    FieldAddressConstants.LATITUDE_MIN_LEN,
    FieldAddressConstants.LATITUDE_MAX_LEN,
  )
  @IsLatitude()
  @IsNotEmpty({ message: 'Latitude code cannot be empty' })
  onopenWorkerLongitude: string;
}
