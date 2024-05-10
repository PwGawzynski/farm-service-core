import { Exclude, Expose } from 'class-transformer';
import { OrderStatus } from '../../../../FarmServiceApiTypes/Order/Enums';
import { OrderPricingResponseDto } from '../../../order-pricing/dto/response/order-pricing-response.dto';

export class OrderResponseWhiteList {
  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: string;
  @Expose()
  clientId: string;
  @Expose()
  name: string;
  @Expose()
  status: OrderStatus;
  @Expose()
  performanceDate: Date;
  /*@Expose()
  totalArea?: string;*/
  @Expose()
  createdAt?: Date;
  @Expose()
  totalArea?: number;
  @Expose()
  openedAt?: Date;
  @Expose()
  additionalInfo: string;
  @Expose()
  pricing?: OrderPricingResponseDto;
}

@Exclude()
export class OrderResponseDto extends OrderResponseWhiteList {
  constructor(partial: Partial<OrderResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
