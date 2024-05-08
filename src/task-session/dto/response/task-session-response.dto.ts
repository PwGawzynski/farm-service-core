import { Exclude, Expose, Type } from 'class-transformer';
import { Task } from '../../../task/entities/task.entity';

@Exclude()
export class CreateTaskSessionResponseWhiteList {
  constructor(partial: Partial<CreateTaskSessionResponseWhiteList>) {
    Object.assign(this, partial);
  }
  @Exclude()
  @Type(() => Task)
  task: Task;

  @Expose()
  openedAt: Date;

  @Expose()
  closedAt?: Date | null;
  @Expose()
  onOpenWorkerLatitude?: string;
  @Expose()
  onOpenWorkerLongitude?: string;
  @Expose()
  onCloseWorkerLatitude?: string;
  @Expose()
  onCloseWorkerLongitude?: string;
}

@Exclude()
export class TaskSessionResponseDto extends CreateTaskSessionResponseWhiteList {
  constructor(partial: Partial<TaskSessionResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
  @Exclude()
  @Type(() => Task)
  task: Task;
}
