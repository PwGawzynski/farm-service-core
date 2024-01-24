import { Body, Controller, Post } from '@nestjs/common';
import { MachineService } from './machine.service';
import { Owner } from '../../decorators/auth.decorators';
import { CreateMachineDto } from './dto/create-machine.dto';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';

@Controller('machine')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
  @Owner()
  async create(
    @Body() createMachineDto: CreateMachineDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.machineService.create(createMachineDto, company);
  }
}
