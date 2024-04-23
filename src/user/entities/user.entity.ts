import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { RefreshToken } from '../../auth/entities/accessToken.entity';
import { UserRole } from '../../../FarmServiceApiTypes/User/Enums';
import { ConflictException } from '@nestjs/common';
import { PersonalData } from '../../personal-data/entities/personalData.entity';
import { Address } from '../../address/entities/address.entity';
import { Client } from '../../clients/entities/client.entity';
import { Company } from '../../company/entities/company.entity';
import { Worker } from '../../worker/entities/worker.entity';
import { Field } from '../../field/entities/field.entity';

/**
 * Class represents User entity in db
 */
@Entity()
export class User extends BaseEntity {
  constructor(props?: {
    role: UserRole;
    account?: Promise<Account>;
    tokens?: Promise<RefreshToken[]>;
  }) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Account, (account) => account.user, {
    onDelete: 'CASCADE',
  })
  account: Promise<Account>;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Client,
  })
  role: UserRole;

  @OneToMany(() => RefreshToken, (token) => token.user, {
    onDelete: 'CASCADE',
  })
  tokens: Promise<RefreshToken[]>;

  @OneToOne(() => PersonalData, (personalData) => personalData.user, {
    nullable: false,
  })
  @JoinColumn({ name: 'personalData' })
  personalData: Promise<PersonalData>;

  @OneToOne(() => Address, (address) => address.user, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_address_id',
  })
  address: Promise<Address>;

  @OneToOne(() => Client, (client) => client.user, { nullable: true })
  client: Promise<Client | null>;

  @OneToOne(() => Company, (company) => company.owner, { nullable: true })
  company: Promise<Company | null>;

  @OneToOne(() => Worker, (worker) => worker.user, { nullable: true })
  worker: Promise<Worker | null>;

  @OneToMany(() => Field, (field: Field) => field.created_by, {
    nullable: true,
  })
  createdFields: Promise<Field[]>;

  @OneToMany(() => Field, (field: Field) => field.owner, {
    nullable: true,
  })
  ownedFields: Promise<Field[]>;
  /**
   * Checks if entity already exist in db
   * @param key one of User properties [keyof User]
   * @param conflictMsg message sent when conflict
   * @throws ConflictException when exist
   */
  async _shouldNotExist<T extends keyof User>(key: T, conflictMsg: string) {
    const exist = await User.findOne({
      where: {
        [key]: Equal(this[key]),
      },
    });
    if (exist) throw new ConflictException(conflictMsg);
  }
}
