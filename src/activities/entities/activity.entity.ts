import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { Field } from '../../field/entities/field.entity';
import { Task } from '../../task/entities/task.entity';
import { ActivityType } from '../../../FarmServiceApiTypes/Activity/Enums';
import { UserRole } from '../../../FarmServiceApiTypes/User/Enums';
import { TaskSession } from '../../task-session/entities/task-session.entity';

@Entity()
export class Activity extends BaseEntity {
  constructor(props?: Partial<Activity>) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.activities, { eager: true })
  causer: User;

  @ManyToOne(() => Company, (company) => company.activities, { eager: true })
  company: Company;

  @ManyToOne(() => Field, (field) => field.activities, { nullable: true })
  field: Promise<Field>;

  @ManyToOne(() => Task, (task) => task.activities, { nullable: true })
  task: Promise<Task>;

  @ManyToOne(() => TaskSession, (s) => s.activities, {
    nullable: true,
    eager: true,
  })
  session: TaskSession;

  @ManyToMany(() => User, (user) => user.receivedActivities, {
    nullable: true,
  })
  receivers: Promise<User[]>;

  @Column({
    type: 'enum',
    enum: ActivityType,
    nullable: false,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
  })
  causerRole: UserRole;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  actionDate: Date;
}
