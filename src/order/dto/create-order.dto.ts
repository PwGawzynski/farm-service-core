import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import OrderConstants from '../../../FarmServiceApiTypes/Order/Constants';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Client } from '../../clients/entities/client.entity';

export class CreateOrderDto {
  @IsString({ message: 'Order name must be an string' })
  @Length(OrderConstants.NAME_MIN_LEN, OrderConstants.NAME_MAX_LEN)
  name: string;

  /*@IsEnum(ServiceType)
  serviceType: ServiceType;*/

  /*@IsDateString(
    { strict: false },
    {
      message: getDateFormatDescriptionFor('performanceDate'),
    },
  )*/
  @IsDate()
  performanceDate: Date;

  @IsOptional()
  @IsString({ message: 'Additional info must be an string' })
  @Length(
    OrderConstants.ADDITIONAL_INFO_MIN_LEN,
    OrderConstants.ADDITIONAL_INFO_MAX_LEN,
  )
  additionalInfo: string;

  @FindOrReject(Client, { message: 'Client not found' })
  client: Client;

  *[Symbol.iterator]() {
    yield this.name;
    yield this.performanceDate;
    yield this.additionalInfo;
  }
}
