import { Controller, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Owner } from '../../decorators/auth.decorators';
import { GetUser } from '../../decorators/user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Owner()
  create(@Body() createCompanyDto: CreateCompanyDto, @GetUser() user: User) {
    return this.companyService.create(createCompanyDto, user);
  }
}
