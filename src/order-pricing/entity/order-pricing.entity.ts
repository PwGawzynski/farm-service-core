import { TaskType } from 'FarmServiceApiTypes/Task/Enums';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity()
export class OrderPricing extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    nullable: false,
  })
  taskType: TaskType;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  tax: number;

  @ManyToOne(() => Order, (o) => o.prices, { eager: true })
  order: Order;
}
