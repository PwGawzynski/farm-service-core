import {
  BaseEntity,
  Column,
  Entity,
  Equal,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { ConflictException } from '@nestjs/common';
import { MachineConstants } from '../../../FarmServiceApiTypes/Machine/Constants';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class Machine extends BaseEntity {
  constructor(props?: Partial<Machine>) {
    super();
    if (props) Object.assign(this, props);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: MachineConstants.NAME_MAX_LEN,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'timestamp',
    default: null,
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  @Column({
    type: 'varchar',
    length: MachineConstants.LICENCE_PLATE_MAX_LEN,
    nullable: false,
  })
  @Index('UNIQ_LICENSE_PLATE', { unique: true })
  licensePlate: string;

  @ManyToOne(() => Company, (company) => company.machines, { nullable: false })
  company: Promise<Company>;

  @OneToMany(() => Task, (task) => task.machine)
  tasks: Promise<Task[]>;

  /* @ManyToMany(() => Task, (task) => task.machines)
  tasks: Promise<Task[] | null>;*/

  async _shouldNotExist<T extends keyof this>(key: T) {
    const exist = await Company.findOne({
      where: {
        [key]: Equal(this[key]),
      },
    });
    if (exist)
      throw new ConflictException(
        `Machine with ${key.toString()} already exist`,
      );
  }
}
