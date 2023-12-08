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