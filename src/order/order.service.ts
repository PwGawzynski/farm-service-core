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

@Injectable()
export class OrderService {
  private async _prepareResponse(order: Order) {
    return new OrderResponseDto({
      id: order.id,
      clientId: (await order.client).id,
      name: order.name,
      status: order.status,
      performanceDate: order.performanceDate,
      createdAt: order.createdAt,
      openedAt: order.openedAt,
      additionalInfo: order.additionalInfo,
      pricePerUnit: order.pricePerUnit,
    });
  }

  private async _prepareCorrectResponse(order: Order) {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await this._prepareResponse(await order),
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
    console.log(await this._prepareCorrectResponse(newOrder));
    return await this._prepareCorrectResponse(newOrder);
  }

  /*findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }*/
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
    const { pricePerUnit, additionalInfo, performanceDate, name } = updateData;
    if ((await order.company).id !== company.id)
      throw new ConflictException(
        'You cannot manage order which bot belonging to yours company',
      );
    order.pricePerUnit = pricePerUnit;
    order.additionalInfo = additionalInfo;
    order.performanceDate = performanceDate;
    order.name = name;
    order.save();
    console.log(await this._prepareCorrectResponse(order));
    return await this._prepareCorrectResponse(order);
  }
}
