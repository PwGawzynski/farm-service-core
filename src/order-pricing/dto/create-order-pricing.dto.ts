import { IsNumber, Max, Min } from 'class-validator';
import { TaskType } from 'FarmServiceApiTypes/Task/Enums';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Order } from '../../order/entities/order.entity';
import { Transform } from 'class-transformer';
import { OrderPricingConstants } from '../../../FarmServiceApiTypes/OrderPricing/Constants';

export class CreateOrderPricingDto {
  @FindOrReject(Order, { message: 'Order not found' })
  order: Order;

  @IsNumber(undefined, { each: true })
  @Transform(({ value }) => new Map(value))
  prices: Map<keyof typeof TaskType, number>;

  @Transform(({ value }) => Number(value))
  @Min(OrderPricingConstants.MIN_TAX)
  @Max(OrderPricingConstants.MAX_TAX)
  tax: number;
}
