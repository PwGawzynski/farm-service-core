import { Injectable } from '@nestjs/common';
import { TaskType } from '../../FarmServiceApiTypes/Task/Enums';
import { OrderPricing } from './entity/order-pricing.entity';
import { Equal } from 'typeorm';
import { OrderPricingResponseDto } from './dto/response/order-pricing-response.dto';

@Injectable()
export class OrderPricingService {
  prepareResponse(orderPricing: OrderPricing[]) {
    if (!orderPricing.length) return undefined;
    return new OrderPricingResponseDto({
      prices: orderPricing.reduce(
        (acc, curr) => ({
          ...acc,
          [TaskType[curr.taskType]]: curr.price,
        }),
        {} as { [K in keyof typeof TaskType]: number },
      ),
      tax: orderPricing[0].tax,
    });
  }
  async save(orderId: string, taskType: TaskType, price: number, tax: number) {
    const exist = await OrderPricing.findOne({
      where: {
        order: { id: Equal(orderId) },
        // due to TypeORM bug, where Enum types from db are returned as strings, even though they are saved as numbers
        taskType: taskType.toString() as any as number,
      },
    });
    if (exist) {
      exist.price = price;
      return exist.save();
    }
    return OrderPricing.create({
      order: { id: orderId },
      taskType,
      tax,
      price,
    }).save();
  }
}
