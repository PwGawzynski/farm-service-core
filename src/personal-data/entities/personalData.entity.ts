import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import { ErrorPayloadObject } from '../../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../../FarmServiceApiTypes/InvalidRequestCodes';

@Entity()
export class PersonalData extends BaseEntity {
  constructor(props?: Partial<PersonalData>) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 70,
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
    length: 250,
  })
  surname: string;

  @Column({
    nullable: false,
    length: 13,
  })
  phoneNumber: string;

  @OneToOne(() => User, (user) => user.personalData, { nullable: true })
  @JoinColumn()
  user: Promise<User>;

  /**
   * Checks if entity already exist in db
   * @param key one of PersonalData properties [keyof User]
   * @param errorCode InvalidRequestCodes code
   * @param conflictMsg message sent when conflict
   * @throws ConflictException when exist
   */
  async _shouldNotExist<T extends keyof PersonalData>(
    key: T,
    errorCode: InvalidRequestCodes,
  ) {
    const exist = await PersonalData.findOne({
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
