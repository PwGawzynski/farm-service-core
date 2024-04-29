import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import FieldAddressConstants from '../../../FarmServiceApiTypes/FiledAddress/Constants';

@Entity()
export class TaskSession extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'opened_at',
  })
  openedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'closed_at',
  })
  closedAt?: Date | null;

  @Column({
    type: 'varchar',
    length: FieldAddressConstants.LATITUDE_MAX_LEN,
    nullable: false,
  })
  onOpenWorkerLatitude: string;

  @Column({
    type: 'varchar',
    length: FieldAddressConstants.LONGITUDE_MAX_LEN,
    nullable: false,
  })
  onOpenWorkerLongitude: string;

  @Column({
    type: 'varchar',
    length: FieldAddressConstants.LATITUDE_MAX_LEN,
    nullable: true,
  })
  onCloseWorkerLatitude: string;

  @Column({
    type: 'varchar',
    length: FieldAddressConstants.LONGITUDE_MAX_LEN,
    nullable: true,
  })
  onCloseWorkerLongitude: string;

  @ManyToOne(() => Task, (task) => task.sessions, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  task: Task;
}
