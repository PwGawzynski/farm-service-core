import { ConflictException, Injectable } from '@nestjs/common';
import { TaskType } from '../../FarmServiceApiTypes/Task/Enums';
import { OrderPricing } from './entity/order-pricing.entity';
import { Equal } from 'typeorm';
import { OrderPricingResponseDto } from './dto/response/order-pricing-response.dto';
import { OrderPricingConstants } from '../../FarmServiceApiTypes/OrderPricing/Constants';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

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

  private validate(price: number, tax: number) {
    if (price < OrderPricingConstants.MIN_PRICE) {
      throw new ConflictException({
        message: 'Price is too low',
        code: InvalidRequestCodes.orderPricing_priceTooLow,
      } as ErrorPayloadObject);
    }
    if (
      tax < OrderPricingConstants.MIN_TAX ||
      tax > OrderPricingConstants.MAX_TAX
    ) {
      throw new ConflictException({
        message: 'Tax is out of range',
        code: InvalidRequestCodes.orderPricing_taxOutOfRange,
      } as ErrorPayloadObject);
    }
  }

  async save(orderId: string, taskType: TaskType, price: number, tax: number) {
    this.validate(price, tax);
    const exist = await OrderPricing.findOne({
      where: {
        order: { id: Equal(orderId) },
        // due to TypeORM bug, where Enum types from db are returned as strings, even though they are saved as numbers
        taskType: taskType.toString() as any as number,
      },
    });
    if (exist) {
      exist.price = price;
      tax && (exist.tax = tax);
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
