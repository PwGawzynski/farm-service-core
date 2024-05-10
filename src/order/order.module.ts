import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderPricingService } from '../order-pricing/order-pricing.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderPricingService],
})
export class OrderModule {}
