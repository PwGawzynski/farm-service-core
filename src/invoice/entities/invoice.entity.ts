import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Client } from '../../clients/entities/client.entity';
import { Company } from '../../company/entities/company.entity';
import { InvoiceRecord } from './invoice-record.entity';

@Entity()
export class Invoice extends BaseEntity {
  constructor(props?: Partial<Invoice>) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  fileName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  number: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  @Index({ unique: true })
  publicAccessToken: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  issueDate: Date;

  @ManyToOne(() => Order, (order) => order.invoice)
  order: Order;

  @ManyToOne(() => Client, (client) => client.invoices)
  client: Client;

  @ManyToOne(() => Company, (company) => company.invoices)
  company: Company;

  @OneToMany(() => InvoiceRecord, (record) => record.invoice, {
    nullable: true,
  })
  records: InvoiceRecord[];
}
