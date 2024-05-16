import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderPricingService } from '../order-pricing/order-pricing.service';
import { InvoiceService } from '../invoice/invoice.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderPricingService, InvoiceService],
})
export class OrderModule {}
