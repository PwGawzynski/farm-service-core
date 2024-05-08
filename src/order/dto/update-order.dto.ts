import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import OrderConstants from '../../../FarmServiceApiTypes/Order/Constants';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Order } from '../entities/order.entity';

export class UpdateOrderDto {
  @FindOrReject(Order, { message: 'Cannot find order with given status' })
  order: Order;

  @IsString({ message: 'Order name must be an string' })
  @IsOptional()
  @Length(OrderConstants.NAME_MIN_LEN, OrderConstants.NAME_MAX_LEN)
  name: string;

  @IsOptional()
  @IsString({ message: 'Additional info must be an string' })
  @Length(
    OrderConstants.ADDITIONAL_INFO_MIN_LEN,
    OrderConstants.ADDITIONAL_INFO_MAX_LEN,
  )
  additionalInfo: string;

  @IsDate()
  @IsOptional()
  performanceDate: Date;
}
