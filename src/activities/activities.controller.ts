import { Controller, Get, Sse } from '@nestjs/common';
import { Owner } from '../../decorators/auth.decorators';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly ActivitiesService: ActivitiesService) {}

  @Get('by-company')
  @Owner()
  @Sse()
  async companyActivities(@GetOwnedCompany() company: Company) {
    return this.ActivitiesService.companyActivities(company);
  }
}
