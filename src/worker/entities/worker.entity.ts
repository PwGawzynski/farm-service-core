import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { Position, Status } from '../../../FarmServiceApiTypes/Worker/Enums';
import { ConflictException } from '@nestjs/common';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class Worker extends BaseEntity {
  constructor(props?: Partial<Worker>) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.worker, {
    nullable: false,
  })
  @JoinColumn()
  user: Promise<User>;

  @ManyToOne(() => Company, (company) => company.workers, { nullable: false })
  @JoinColumn()
  company: Promise<Company>;

  @OneToMany(() => Task, (task) => task.worker, { nullable: true })
  @JoinTable({ name: 'worker_tasks' })
  tasks?: Promise<Task[]>;

  @Column({
    type: 'enum',
    enum: Position,
    default: Position.Operator,
  })
  position?: Position;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status?: Status;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  hiredAt: Date;

  async _shouldNotExist<T extends keyof this>(key: T) {
    console.log(this[key], 'KURA', Equal(this[key]));
    const exist = await Worker.findOne({
      where: {
        [key]: Equal(this[key]),
      },
    });
    if (exist)
      throw new ConflictException(
        `Worker with given ${key.toString()} already exist`,
      );
  }
}
