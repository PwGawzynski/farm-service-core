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
import { TaskType } from '../../FarmServiceApiTypes/Task/Enums';
import { Equal } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InvoiceService } from '../invoice/invoice.service';
import { AccountOrderDto } from './dto/account-order.dto';
import { AccountingResponseDto } from './dto/response/accounting.response.dto';
import { Task } from '../task/entities/task.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { InvoiceResponseDto } from '../invoice/dot/response/invoice-response.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly OrderPricingService: OrderPricingService,
    private readonly InvoiceService: InvoiceService,
  ) {}

  /**
   * ---------------------------RESPONSE_PREPARATION----------------------------
   */
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
  /**
   *
   * ---------------------------ACCOUNT_VALIDATION------------------------------
   */
  private async getOrder(orderId: string, company: Company): Promise<Order> {
    const order = await Order.findOne({
      where: { id: Equal(orderId) },
      relations: ['tasks', 'prices', 'company'],
    });
    if (!order || (await order.company).id !== company.id) {
      throw new ConflictException(
        'Order not found or does not belong to your company',
      );
    }
    return order;
  }

  private canAccountOrder(tasks: Task[]): boolean | void {
    if (tasks?.some((t) => !t.isDone))
      throw new ConflictException('All tasks must be done');
    return true;
  }

  private createAccountRes(
    invoice: Invoice,
  ): ResponseObject<AccountingResponseDto> {
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new InvoiceResponseDto({
        number: invoice.number,
        invoiceDownloadLink: `http://localhost:3006/invoice/?token=${invoice.publicAccessToken}`,
        issueDate: invoice.issueDate.toISOString(),
      }),
    };
  }

  /**
   * ---------------------------ORDER_IN_COMPANY_AND_ID_VALIDATION--------------
   */
  private async orderIdAndInCompany(
    order: Order,
    company: Company,
  ): Promise<Order | void> {
    // due to orderId is optional in entity
    if (!order.id) throw new ConflictException('Order ID is required');
    if ((await order.company).id !== company.id)
      throw new ConflictException(
        'You cannot manage order which not belonging to yours company',
      );
  }

  /**
   * --------------------------------SERVICES--------------------------------
   */

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
    await this.orderIdAndInCompany(order, company);
    const prices: OrderPricing[] = [];
    for (const [key, val] of data.prices) {
      prices.push(
        await this.OrderPricingService.save(
          order.id as string,
          TaskType[key],
          val,
          data.tax,
        ),
      );
    }
    const oldPrices = (await order.prices) || [];
    return this._prepareCorrectResponse(order, [...oldPrices, ...prices]);
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
    await this.orderIdAndInCompany(order, company);
    order.additionalInfo = additionalInfo;
    order.performanceDate = performanceDate;
    order.name = name;
    order.save();
    return await this._prepareCorrectResponse(order);
  }

  async account(orderId: string, company: Company, data: AccountOrderDto) {
    const order = await this.getOrder(orderId, company);
    this.canAccountOrder(data.tasks);

    const res = await this.InvoiceService.create(order, data.tasks);
    if (res) {
      order.status = OrderStatus.InAccounting;
      order.save();
      return this.createAccountRes(res);
    }
  }
}
