import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ConflictException } from '@nestjs/common';
import { Theme } from '../../../FarmServiceApiTypes/Account/Constants';
/**
 * Class represents account data in db
 */
@Entity()
export class Account extends BaseEntity {
  constructor(props?: {
    email: string;
    password: string;
    activationCode: string;
    user: Promise<User>;
    isActivated?: boolean;
  }) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 350,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    length: 200,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isActivated: boolean;

  @Column({
    enum: Theme,
    type: 'enum',
    default: Theme.dark,
  })
  theme?: Theme;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: false,
  })
  activationCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  resetPasswordToken: string | null;

  @OneToOne(() => User, (user) => user.account, { onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'user_id',
  })
  user: Promise<User>;

  async _shouldNotExist<T extends keyof this>(key: T, conflictMsg: string) {
    const exist = await Account.findOne({
      where: {
        [key]: this[key],
      },
    });
    if (exist) throw new ConflictException(conflictMsg);
  }
}
