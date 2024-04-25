import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../address/entities/address.entity';
import { Client } from '../../clients/entities/client.entity';
import { ConflictException } from '@nestjs/common';
import { CompanyConstants } from '../../../FarmServiceApiTypes/Company/Constants';

@Entity()
export class ClientsCompany extends BaseEntity {
  constructor(props?: Partial<ClientsCompany>) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: CompanyConstants.MAX_NAME_LENGTH,
    nullable: false,
  })
  @Index('UNIQUE_NAME', { unique: true })
  name: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('varchar', {})
  @Index('UNIQUE_NIP', { unique: true })
  NIP: string;

  @Column('varchar', { length: CompanyConstants.MAX_PHONE_LENGTH })
  phoneNumber: string;

  @Column('varchar', { length: CompanyConstants.MAX_EMAIL_LENGTH })
  @Index('UNIQUE_EMAIL', { unique: true })
  email: string;

  @OneToOne(() => Address, { nullable: false })
  @JoinColumn({ name: 'address_id' })
  address: Promise<Address>;

  @OneToOne(() => Client, (client) => client.company, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  async _shouldNotExist<T extends keyof this>(key: T, conflictMsg: string) {
    const exist = await ClientsCompany.findOne({
      where: {
        [key]: Equal(this[key]),
      },
    });
    if (exist) throw new ConflictException(conflictMsg);
  }
}
