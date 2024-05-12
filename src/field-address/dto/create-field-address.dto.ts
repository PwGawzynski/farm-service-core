import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import FieldAddressConstants from '../../../FarmServiceApiTypes/FiledAddress/Constants';

export class CreateFieldAddressDto {
  @IsString({
    message: 'City must be a string type',
  })
  @Length(
    FieldAddressConstants.CITY_MIN_LEN,
    FieldAddressConstants.CITY_MAX_LEN,
  )
  @IsNotEmpty({ message: 'City cannot be empty' })
  city: string;

  @IsString({ message: 'County must be a string type' })
  @Length(
    FieldAddressConstants.COUNTY_MIN_LEN,
    FieldAddressConstants.COUNTY_MAX_LEN,
  )
  @IsNotEmpty({ message: 'County cannot be empty' })
  county: string;

  @IsString({ message: 'Voivodeship must be a string type' })
  @Length(
    FieldAddressConstants.VOIVODESHIP_MIN_LEN,
    FieldAddressConstants.VOIVODESHIP_MAX_LEN,
  )
  @IsNotEmpty({ message: 'Voivodeship cannot be empty' })
  voivodeship: string;

  @IsString({ message: 'Longitude code must be a string type' })
  @Length(
    FieldAddressConstants.LONGITUDE_MIN_LEN,
    FieldAddressConstants.LONGITUDE_MAX_LEN,
  )
  @IsLongitude()
  @IsNotEmpty({ message: 'Longitude code cannot be empty' })
  longitude: string;

  @IsString({ message: 'Latitude code must be a string type' })
  @Length(
    FieldAddressConstants.LATITUDE_MIN_LEN,
    FieldAddressConstants.LATITUDE_MAX_LEN,
  )
  @IsLatitude()
  @IsNotEmpty({ message: 'Latitude code cannot be empty' })
  latitude: string;
}
