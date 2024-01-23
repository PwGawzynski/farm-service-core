import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

/**
 * This column represents all address in application, is used to store both user and company addresses
 */
@Entity()
export class Address extends BaseEntity {
  constructor(props?: {
    city: string;
    county: string;
    postalCode: string;
    houseNumber: string;
    apartmentNumber?: string | undefined;
    user?: Promise<User>;
    voivodeship?: string;
    street?: string;
  }) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    length: 70,
  })
  city: string;

  @Column({
    length: 50,
    nullable: false,
  })
  county: string;

  @Column({
    length: 50,
    nullable: true,
  })
  voivodeship?: string;

  @Column({
    length: 6,
    nullable: false,
  })
  postalCode: string;

  @Column({
    length: 100,
    nullable: true,
  })
  street?: string;

  @Column({
    length: 20,
    nullable: false,
  })
  houseNumber: string;

  @Column({
    length: 20,
    nullable: true,
  })
  apartmentNumber?: string | undefined;

  @OneToOne(() => User, (user) => user.address, { nullable: true })
  user?: Promise<User | null>;

  @OneToOne(() => Company, (company) => company.address, { nullable: true })
  company?: Promise<Company | null>;
}
