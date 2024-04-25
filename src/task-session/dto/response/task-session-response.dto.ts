import { Exclude, Expose } from 'class-transformer';

export class CreateTaskSessionResponseWhiteList {
  constructor(partial: Partial<CreateTaskSessionResponseWhiteList>) {
    Object.assign(this, partial);
  }

  @Expose()
  openedAt: Date;

  @Expose()
  closedAt?: Date | null;
}

@Exclude()
export class TaskSessionResponseDto extends CreateTaskSessionResponseWhiteList {
  constructor(partial: Partial<TaskSessionResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
