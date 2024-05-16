import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ClientsCompany } from '../../clients_company/entities/clients_company.entity';
import { Company } from '../../company/entities/company.entity';
import { Order } from '../../order/entities/order.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity()
export class Client extends BaseEntity {
  constructor(props?: Partial<Client>) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.client, { nullable: false, eager: true })
  @JoinColumn()
  user: User;

  @OneToOne(() => ClientsCompany, (company) => company.client, {
    nullable: true,
  })
  company: Promise<ClientsCompany | null>;

  @ManyToOne(() => Company, (company) => company.clients, { nullable: false })
  isClientOf: Promise<Company | null>;

  @OneToMany(() => Order, (order) => order.client, { nullable: true })
  orders: Promise<Order[] | null>;

  @OneToMany(() => Invoice, (invoice) => invoice.client, { nullable: true })
  invoices: Promise<Invoice[] | null>;
}
