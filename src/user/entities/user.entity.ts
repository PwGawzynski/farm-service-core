import {
  BaseEntity,
  Column,
  Entity,
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
import { Company } from '../../company/entities/company.entity';

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

  @OneToOne(() => Account, (account) => account.user, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'account_id',
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
  @JoinColumn({ name: 'personal_data' })
  personalData: Promise<PersonalData>;

  @OneToOne(() => Address, (address) => address.user, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_address_id',
  })
  address: Promise<Address>;

  @OneToOne(() => Company, (company) => company.owner, { nullable: true })
  company: Promise<Company | null>;

  /**
   * Checks if entity already exist in db
   * @param key one of User properties [keyof User]
   * @param conflictMsg message sent when conflict
   * @throws ConflictException when exist
   */
  async _shouldNotExist<T extends keyof User>(key: T, conflictMsg: string) {
    const exist = await User.findOne({
      where: {
        [key]: this[key],
      },
    });
    if (exist) throw new ConflictException(conflictMsg);
  }
}
