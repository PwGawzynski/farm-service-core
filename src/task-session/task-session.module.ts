import { Module } from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';
import { TaskSessionService } from './task-session.service';

@Module({
  providers: [TaskSessionService, ActivitiesService],
})
export class TaskSessionModule {}
