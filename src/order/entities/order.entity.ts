import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import OrderConstants from '../../../FarmServiceApiTypes/Order/Constants';
import { Company } from '../../company/entities/company.entity';
import { Field } from '../../field/entities/field.entity';
import { OrderStatus } from '../../../FarmServiceApiTypes/Order/Enums';
import { Client } from '../../clients/entities/client.entity';
import { Task } from '../../task/entities/task.entity';
import { OrderPricing } from '../../order-pricing/entity/order-pricing.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity()
export class Order extends BaseEntity {
  constructor(options?: Partial<Order>) {
    super();
    if (options) Object.assign(this, options);
  }

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'varchar',
    length: OrderConstants.NAME_MAX_LEN,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Added,
    nullable: false,
  })
  status?: OrderStatus;

  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'performance_date',
  })
  performanceDate: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt?: Date;

  @Column({
    type: 'varchar',
    length: OrderConstants.ADDITIONAL_INFO_MAX_LEN,
    nullable: true,
    name: 'additional_info',
  })
  additionalInfo?: string;

  @VirtualColumn({
    type: 'mediumint',
    query: (alias) =>
      `SELECT SUM(field.area)  FROM task INNER JOIN  field ON task.field_id = field.id WHERE order_id=${alias}.id`,
  })
  totalArea?: number;

  @VirtualColumn({
    type: 'timestamp',
    query: (alias) =>
      `SELECT task.opened_at FROM task WHERE task.order_id = ${alias}.id ORDER BY task.opened_at DESC LIMIT 1`,
  })
  openedAt?: Date;

  @ManyToOne(() => Company, (company) => company.orders, {
    nullable: false,
  })
  company: Promise<Company>;

  @ManyToOne(() => Client, (client) => client.orders, { nullable: false })
  client: Promise<Client>;

  @ManyToMany(() => Field, (field) => field.orders, { nullable: true })
  @JoinTable({ name: 'orders_fields' })
  fields?: Promise<Field[] | null>;

  @OneToMany(() => Task, (t) => t.order, { nullable: true })
  tasks?: Promise<Task[] | null>;

  @OneToMany(() => OrderPricing, (p) => p.order, { nullable: true })
  prices?: Promise<OrderPricing[] | null>;

  @OneToMany(() => Invoice, (i) => i.order, { nullable: true })
  invoice?: Promise<Invoice | null>;
}
