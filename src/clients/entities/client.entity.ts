import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ClientsCompany } from '../../clients_company/entities/clients_company.entity';
import { Company } from '../../company/entities/company.entity';

@Entity()
export class Client extends BaseEntity {
  constructor(props?: {
    user: User;
    company?: Promise<ClientsCompany | null>;
    isClientOf?: Promise<Company | null>;
  }) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.client, { nullable: false })
  @JoinColumn()
  user: User;

  @OneToOne(() => ClientsCompany, (company) => company.client, {
    nullable: true,
  })
  company: Promise<ClientsCompany | null>;

  @ManyToOne(() => Company, (company) => company.clients, { nullable: false })
  isClientOf: Promise<Company | null>;
}
