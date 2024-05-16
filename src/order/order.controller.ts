import { Controller, Post, Body, Get, Put, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
import { Owner } from '../../decorators/auth.decorators';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderPricingDto } from '../order-pricing/dto/create-order-pricing.dto';
import { AccountOrderDto } from './dto/account-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Owner()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.orderService.create(createOrderDto, company);
  }

  @Get('all')
  @Owner()
  findAll(@GetOwnedCompany() company: Company) {
    return this.orderService.getAll(company);
  }

  @Put()
  @Owner()
  update(
    @Body() updateData: UpdateOrderDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.orderService.update(updateData, company);
  }

  @Put('update-pricing')
  @Owner()
  updatePricing(
    @Body() updateData: CreateOrderPricingDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.orderService.updatePricing(updateData, company);
  }

  @Put('account')
  @Owner()
  account(
    @Query('id') orderId: string,
    @GetOwnedCompany() company: Company,
    @Body() data: AccountOrderDto,
  ) {
    return this.orderService.account(orderId, company, data);
  }
}
