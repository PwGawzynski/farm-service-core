import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { Owner, Worker as WorkerRole } from '../../decorators/auth.decorators';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { GetOwnedCompany, GetUser } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @Owner()
  async assign(
    @Body() createWorkerDto: CreateWorkerDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.workerService.assign(createWorkerDto, company);
  }

  @Get()
  @WorkerRole()
  async getInfo(@GetUser() user: User) {
    return this.workerService.getInfo(user);
  }

  @Sse('sse/info')
  info(@GetUser() user: User) {
    return this.workerService.info(user);
  }
}
