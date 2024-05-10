import { IsEnum, IsNumber } from 'class-validator';
import { TaskType } from 'FarmServiceApiTypes/Task/Enums';
import { FindOrReject } from '../../../ClassValidatorCustomDecorators/FindOrReject.decorator';
import { Order } from '../../order/entities/order.entity';

export class CreateOrderPricingDto {
  @FindOrReject(Order, { message: 'Order not found' })
  order: Order;
  @IsEnum(TaskType)
  taskType: TaskType;
  @IsNumber()
  price: number;
  @IsNumber()
  tax: number;
}
