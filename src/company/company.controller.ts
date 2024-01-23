import { Controller, Post, Body, Get } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Owner } from '../../decorators/auth.decorators';
import { GetOwnedCompany, GetUser } from '../../decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { Company } from './entities/company.entity';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Owner()
  create(@Body() createCompanyDto: CreateCompanyDto, @GetUser() user: User) {
    return this.companyService.create(createCompanyDto, user);
  }

  @Get()
  @Owner()
  async get(@GetOwnedCompany() company: Company) {
    return this.companyService.get(company);
  }
}
