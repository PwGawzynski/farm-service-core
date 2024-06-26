import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ConflictException } from '@nestjs/common';
import { Theme } from '../../../FarmServiceApiTypes/Account/Constants';
import { InvalidRequestCodes } from '../../../FarmServiceApiTypes/InvalidRequestCodes';
import { ErrorPayloadObject } from '../../../FarmServiceApiTypes/Respnse/errorPayloadObject';
/**
 * Class represents account data in db
 */
@Entity()
export class Account extends BaseEntity {
  constructor(props?: Partial<Account>) {
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
    nullable: true,
    type: 'varchar',
  })
  password: string | null;

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

  @OneToOne(() => User, (user) => user.account, {
    onDelete: 'NO ACTION',
    nullable: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: Promise<User | null>;

  async _shouldNotExist<T extends keyof this>(
    key: T,
    errorCode: InvalidRequestCodes,
  ) {
    const exist = await Account.findOne({
      where: {
        [key]: Equal(this[key]),
      },
    });
    if (exist)
      throw new ConflictException({
        code: errorCode,
        message: `Account with ${key as string}  already exist`,
      } as ErrorPayloadObject);
  }
}
