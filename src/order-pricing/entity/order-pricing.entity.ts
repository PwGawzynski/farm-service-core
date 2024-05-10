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
    type: 'decimal',
    nullable: false,
  })
  price: number;

  @Column({
    type: 'decimal',
    nullable: false,
  })
  tax: number;

  @ManyToOne(() => Order, (o) => o.prices, { eager: true })
  order: Order;
}
