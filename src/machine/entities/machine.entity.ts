import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { ConflictException } from '@nestjs/common';

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
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  @Index('UNIQ_LICENSE_PLATE', { unique: true })
  licensePlate: string;

  @ManyToOne(() => Company, (company) => company.machines, { nullable: false })
  company: Promise<Company>;

  /* @ManyToMany(() => Task, (task) => task.machines)
  tasks: Promise<Task[] | null>;*/

  async _shouldNotExist<T extends keyof this>(key: T) {
    const exist = await Company.findOne({
      where: {
        [key]: this[key],
      },
    });
    if (exist)
      throw new ConflictException(
        `Machine with ${key.toString()} already exist`,
      );
  }
}
