import { Injectable } from '@nestjs/common';
import { TaskSession } from './entities/task-session.entity';
import { Equal, IsNull } from 'typeorm';
import { TaskSessionResponseDto } from './dto/response/task-session-response.dto';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class TaskSessionService {
  async preOpenValidate(workerId: string) {
    const existOpenedSession = await TaskSession.findOne({
      where: {
        task: { worker: { id: Equal(workerId) } },
        closedAt: IsNull(),
      },
    });
    if (existOpenedSession) {
      throw new Error(
        'Another task is already opened, you have to close it first',
      );
    }
  }

  prepareResponseDto(task: TaskSession) {
    return new TaskSessionResponseDto(task);
  }

  async open(task: Task): Promise<TaskSession> {
    await this.preOpenValidate((await task.worker).id);
    const session = new TaskSession();
    session.task = task;
    session.save();
    return session;
  }

  async findOpen(t: Task) {
    return TaskSession.find({
      where: {
        task: { id: Equal(t.id) },
        closedAt: IsNull(),
      },
    });
  }

  async findOrThrow(task: Task): Promise<TaskSession> {
    const t = await TaskSession.findOne({
      where: {
        task: { id: task.id },
        closedAt: IsNull(),
      },
    });
    if (!t) {
      throw new Error('Task session not found');
    }
    return t;
  }

  async close(task: Task) {
    const session = await this.findOrThrow(task);
    if (session) {
      session.closedAt = new Date();
      session.save();
      return session;
    }
  }
}
