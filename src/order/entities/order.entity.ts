import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import OrderConstants from '../../../FarmServiceApiTypes/Order/Constants';
import { Company } from '../../company/entities/company.entity';
import { Field } from '../../field/entities/field.entity';
import { OrderStatus } from '../../../FarmServiceApiTypes/Order/Enums';
import { Client } from '../../clients/entities/client.entity';
import { Task } from '../../task/entities/task.entity';

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

  //TODO move to task entity, it will allow to have multiple service types in one order

  /* @Column({
    type: 'enum',
    enum: ServiceType,
    nullable: false,
    name: 'Service_Type',
  })
  serviceType: ServiceType;*/

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
    type: 'timestamp',
    nullable: true,
    name: 'opened_at',
    comment: 'date of start first task from order',
  })
  openedAt?: Date;

  @Column({
    type: 'varchar',
    length: OrderConstants.ADDITIONAL_INFO_MAX_LEN,
    nullable: true,
    name: 'additional_info',
  })
  additionalInfo?: string;

  // TODO virtual column for totalDoneArea based on isDone in connection table ManyToMany order-field(Task)
  /*@VirtualColumn({
    type: 'mediumint',
    query: (alias) =>
      `SELECT SUM(area) FROM field WHERE field.orderId = ${alias}.id `,
  })
  totalArea?: string;
*/
  @Column({
    type: 'numeric',
    precision: 9,
    scale: OrderConstants.MIN_PRICE_PER_UNIT_SCALE,
    name: 'price_per_unit',
    nullable: true,
  })
  pricePerUnit?: number;

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
}
