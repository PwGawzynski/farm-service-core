import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { FieldModule } from '../field/field.module';
import { WorkerModule } from '../worker/worker.module';
import { MachineModule } from '../machine/machine.module';
import { TaskSessionService } from '../task-session/task-session.service';
import { ActivitiesService } from '../activities/activities.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskSessionService, ActivitiesService],
  imports: [FieldModule, WorkerModule, MachineModule],
  exports: [TaskService],
})
export class TaskModule {}
