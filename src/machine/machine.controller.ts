import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { MachineService } from './machine.service';
import { Owner } from '../../decorators/auth.decorators';
import { CreateMachineDto } from './dto/create-machine.dto';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
import { UpdateMachineDto } from './dto/update-machine.dto';

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

  @Get('all')
  @Owner()
  async getAll(@GetOwnedCompany() company: Company) {
    return this.machineService.getAll(company);
  }

  @Put()
  @Owner()
  async update(
    @Body() updateData: UpdateMachineDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.machineService.update(updateData, company);
  }

  @Post('safely-delete')
  @Owner()
  async safelyDelete(
    @Body() deleteData: UpdateMachineDto,
    @GetOwnedCompany() company: Company,
  ) {
    return this.machineService.safelyDelete(deleteData, company);
  }
}
