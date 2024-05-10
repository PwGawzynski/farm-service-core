import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Company } from '../company/entities/company.entity';
import { Order } from './entities/order.entity';
import { OrderResponseDto } from './dto/response/order.response.dto';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { v4 as uuid } from 'uuid';
import { OrderStatus } from '../../FarmServiceApiTypes/Order/Enums';
import { UpdateOrderDto } from './dto/update-order.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OrderPricingService } from '../order-pricing/order-pricing.service';
import { CreateOrderPricingDto } from '../order-pricing/dto/create-order-pricing.dto';
import { OrderPricing } from '../order-pricing/entity/order-pricing.entity';

@Injectable()
export class OrderService {
  constructor(private readonly OrderPricingService: OrderPricingService) {}
  private async _prepareResponse(order: Order, pricing_?: OrderPricing[]) {
    const pricing = pricing_ || (await order.prices);
    return new OrderResponseDto({
      id: order.id,
      clientId: (await order.client).id,
      name: order.name,
      status: order.status,
      performanceDate: order.performanceDate,
      createdAt: order.createdAt,
      openedAt: order.openedAt,
      totalArea: order.totalArea,
      additionalInfo: order.additionalInfo,
      pricing: pricing
        ? this.OrderPricingService.prepareResponse(pricing)
        : undefined,
    });
  }

  private async _prepareCorrectResponse(
    order: Order,
    pricing?: OrderPricing[],
  ) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this._prepareResponse(await order, pricing),
    } as ResponseObject<OrderResponseDto>;
  }

  async create(createOrderDto: CreateOrderDto, company: Company) {
    const { client } = createOrderDto;
    if (company.id !== (await client.isClientOf)?.id)
      throw new Error('You dont have such client');
    const newOrder = new Order({
      ...createOrderDto,
      id: uuid(),
      status: OrderStatus.Added,
      createdAt: new Date(),
      company: Promise.resolve(company),
      client: Promise.resolve(client),
    });
    newOrder.save();
    return await this._prepareCorrectResponse(newOrder);
  }

  async updatePricing(data: CreateOrderPricingDto, company: Company) {
    const order = data.order;
    if ((await order.company).id !== company.id)
      throw new ConflictException(
        'You cannot manage order which not belonging to yours company',
      );
    const prices = await this.OrderPricingService.save(
      order.id as string,
      data.taskType,
      data.price,
      data.tax,
    );
    const oldPrices = (await order.prices) || [];
    return this._prepareCorrectResponse(order, [...oldPrices, prices]);
  }
  async getAll(company: Company) {
    const orders = await company.orders;
    if (!orders)
      return {
        code: ResponseCode.ProcessedCorrect,
        payload: [],
      } as ResponseObject<OrderResponseDto[]>;
    const res = await Promise.all(orders?.map((o) => this._prepareResponse(o)));
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: res,
    } as ResponseObject<OrderResponseDto[]>;
  }

  async update(updateData: UpdateOrderDto, company: Company) {
    const order = updateData.order;
    const { additionalInfo, performanceDate, name } = updateData;
    if ((await order.company).id !== company.id)
      throw new ConflictException(
        'You cannot manage order which bot belonging to yours company',
      );
    order.additionalInfo = additionalInfo;
    order.performanceDate = performanceDate;
    order.name = name;
    order.save();
    console.log(await this._prepareCorrectResponse(order));
    return await this._prepareCorrectResponse(order);
  }
}
