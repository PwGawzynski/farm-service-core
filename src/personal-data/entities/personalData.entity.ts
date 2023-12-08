import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class PersonalData extends BaseEntity {
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
}
