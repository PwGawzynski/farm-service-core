import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
import { Owner } from '../../decorators/auth.decorators';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderPricingDto } from '../order-pricing/dto/create-order-pricing.dto';

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
  /*@Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }*/
}
