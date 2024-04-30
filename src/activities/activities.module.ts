import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { TaskSessionService } from '../task-session/task-session.service';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, TaskSessionService],
})
export class ActivitiesModule {}
