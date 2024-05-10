import { Exclude, Expose } from 'class-transformer';
import { TaskType } from 'FarmServiceApiTypes/Task/Enums';

class OrderPricingResponseWhiteList {
  constructor(partial: Partial<OrderPricingResponseDto>) {
    Object.assign(this, partial);
  }
  @Exclude()
  id: string;
  @Expose()
  prices: {
    [K in keyof typeof TaskType]: number;
  };
  @Expose()
  tax: number;
}

@Exclude()
export class OrderPricingResponseDto extends OrderPricingResponseWhiteList {
  constructor(partial: Partial<OrderPricingResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
