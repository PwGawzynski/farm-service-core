import { Body, Controller, Post } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { Owner } from '../../decorators/auth.decorators';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';

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
}
