import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../address/entities/address.entity';
import { User } from '../../user/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import { Client } from '../../clients/entities/client.entity';
import { CompanyConstants } from '../../../FarmServiceApiTypes/Company/Constants';
import { Worker } from '../../worker/entities/worker.entity';
import { Machine } from '../../machine/entities/machine.entity';

@Entity()
export class Company extends BaseEntity {
  constructor(props?: Partial<Company>) {
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

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: Promise<User>;

  @OneToMany(() => Client, (client) => client.isClientOf, { nullable: true })
  clients: Promise<Client[] | null>;

  @OneToMany(() => Worker, (worker) => worker.company, { nullable: true })
  workers: Promise<Worker[] | null>;

  @OneToMany(() => Machine, (machine) => machine.company, { nullable: true })
  machines: Promise<Machine[] | null>;

  async _shouldNotExist<T extends keyof this>(key: T, conflictMsg: string) {
    if (
      !(
        typeof this[key] !== 'string' ||
        typeof this[key] !== 'number' ||
        typeof this[key] !== 'boolean'
      )
    )
      throw new Error('Invalid key type');
    const exist = await Company.findOne({
      where: {
        [key]: this[key],
      },
    });
    console.log((await exist?.owner)?.id, 'shouldNot', key, this[key]);
    if (exist) throw new ConflictException(conflictMsg);
  }
}
