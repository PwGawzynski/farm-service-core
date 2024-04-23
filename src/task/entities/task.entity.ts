import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Field } from '../../field/entities/field.entity';
import { Worker } from '../../worker/entities/worker.entity';
import { Company } from '../../company/entities/company.entity';
import { Machine } from '../../machine/entities/machine.entity';
import { TaskType } from '../../../FarmServiceApiTypes/Task/Enums';
import { TaskSession } from '../../task-session/entities/task-session.entity';

@Entity()
export class Task extends BaseEntity {
  constructor(partial?: Partial<Task>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'bool',
    default: false,
    name: 'is_done',
  })
  isDone?: boolean;

  @Column({
    type: 'enum',
    enum: TaskType,
    nullable: false,
  })
  type: TaskType;

  // TODO add connection table task-[start-pause-logs] to store logs when task is opened passed opened and closed

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'opened_at',
  })
  openedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'performance_date',
  })
  performanceDate?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'closed_at',
  })
  closedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_paused_at',
  })
  lastPausedAt?: Date;

  @ManyToOne(() => Order, (order) => order.tasks)
  @JoinColumn({ name: 'order_id' })
  order: Promise<Order>;

  @ManyToOne(() => Worker, (worker) => worker.tasks)
  @JoinColumn({ name: 'worker_id' })
  worker: Promise<Worker>;

  @ManyToOne(() => Field, (field) => field.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: Promise<Field>;

  @ManyToOne(() => Machine, (machine) => machine.tasks, { cascade: true })
  machine: Promise<Machine>;

  @ManyToOne(() => Company, (company) => company.tasks)
  @JoinColumn({ name: 'company_id' })
  company: Promise<Company>;

  @OneToMany(() => TaskSession, (taskSession) => taskSession.task, {
    cascade: true,
  })
  sessions: Promise<TaskSession[] | null>;

  //async _shouldBeValidWhenCreate(company: Company) {}
}
