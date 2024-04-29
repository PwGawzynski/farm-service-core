import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Owner, Worker as WorkerRole } from '../../decorators/auth.decorators';
import { CrateTaskCollection } from './dto/create-task.dto';
import { GetOwnedCompany, GetWorker } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
import { Worker } from '../worker/entities/worker.entity';
import { TaskSessionEntityDto } from '../task-session/dto/TaskSessionEntity.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Owner()
  async create(
    @Body() createTaskDto: CrateTaskCollection,
    @GetOwnedCompany() company: Company,
  ) {
    return this.taskService.create(createTaskDto, company);
  }

  @Get()
  @Owner()
  async getByOrder(
    @GetOwnedCompany() company: Company,
    @Query('order-id') orderId: string,
  ) {
    return this.taskService.getByCompany(company, orderId);
  }

  @Put('open')
  @WorkerRole()
  async startTask(
    @GetWorker() worker: Worker,
    @Query('task-id') taskId: string,
    @Body() sessionData: TaskSessionEntityDto,
  ) {
    return this.taskService.startTask(taskId, worker, sessionData);
  }

  @Put('close')
  @WorkerRole()
  async closeTask(
    @GetWorker() worker: Worker,
    @Query('task-id') taskId: string,
    @Body() sessionData: TaskSessionEntityDto,
  ) {
    return this.taskService.closeTask(taskId, worker, sessionData);
  }

  @Put('close-by-owner')
  @Owner()
  async closeTaskOwner(
    @GetOwnedCompany() company: Company,
    @Query('task-id') taskId: string,
  ) {
    return this.taskService.closeByOwner(taskId, company);
  }

  @Put('pause')
  @WorkerRole()
  async pause(
    @GetWorker() worker: Worker,
    @Query('task-id') taskId: string,
    @Body() sessionData: TaskSessionEntityDto,
  ) {
    return this.taskService.pause(taskId, worker, sessionData);
  }

  @Delete()
  @Owner()
  delete(@Query('task-id') id: string, @GetOwnedCompany() company: Company) {
    return this.taskService.delete(id, company);
  }

  @Sse('assigned')
  @WorkerRole()
  async getAssigned(@GetWorker() worker: Worker) {
    return this.taskService.workerTasks(worker);
  }
}
