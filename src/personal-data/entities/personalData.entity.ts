import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ConflictException } from '@nestjs/common';

@Entity()
export class PersonalData extends BaseEntity {
  constructor(props?: {
    name: string;
    surname: string;
    phoneNumber: string;
    user?: Promise<User>;
  }) {
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
    length: 12,
  })
  phoneNumber: string;

  @OneToOne(() => User, (user) => user.personalData, { nullable: true })
  @JoinColumn()
  user: Promise<User>;

  /**
   * Checks if entity already exist in db
   * @param key one of PersonalData properties [keyof User]
   * @param conflictMsg message sent when conflict
   * @throws ConflictException when exist
   */
  async _shouldNotExist<T extends keyof PersonalData>(
    key: T,
    conflictMsg: string,
  ) {
    const exist = await PersonalData.findOne({
      where: {
        [key]: this[key],
      },
    });
    if (exist) throw new ConflictException(conflictMsg);
  }
}
