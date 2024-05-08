import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { ClientsCompany } from '../../clients_company/entities/clients_company.entity';
import AddressConstants from '../../../FarmServiceApiTypes/Address/Constants';

/**
 * This column represents all address in application, is used to store both user and company addresses
 */
@Entity()
export class Address extends BaseEntity {
  constructor(props?: Partial<Address>) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: AddressConstants.CITY_MAX_LEN,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.COUNTY_MAX_LEN,
    nullable: false,
  })
  county: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.VOIVODESHIP_MAX_LEN,
    nullable: true,
  })
  voivodeship?: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.POSTAL_CODE_LEN,
    nullable: false,
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.STREET_MAX_LEN,
    nullable: true,
  })
  street?: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.HOUSE_NR_MAX_LEN,
    nullable: false,
  })
  houseNumber: string;

  @Column({
    type: 'varchar',
    length: AddressConstants.APARTMENT_NR_MAX_LEN,
    nullable: true,
  })
  apartmentNumber?: string | undefined;

  @OneToOne(() => User, (user) => user.address, { nullable: true })
  user?: Promise<User | null>;

  @OneToOne(() => Company, (company) => company.address, { nullable: true })
  company?: Promise<Company | null>;

  @OneToOne(() => ClientsCompany, (company) => company.address, {
    nullable: true,
  })
  clientsCompany?: Promise<ClientsCompany | null>;
}
