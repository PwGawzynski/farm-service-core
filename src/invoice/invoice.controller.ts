import { Controller, Get, ParseEnumPipe, Query, Res } from '@nestjs/common';
import { Owner, Public } from '../../decorators/auth.decorators';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';
import { InvoiceLanguage } from '../../FarmServiceApiTypes/InvoiceEntity/Enums';
import { GetOwnedCompany } from '../../decorators/user.decorator';
import { Company } from '../company/entities/company.entity';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Public()
  getInvoice(
    @Query('token') token: string,
    @Query('version', new ParseEnumPipe(InvoiceLanguage))
    version: InvoiceLanguage,
    @Res() res: Response,
  ) {
    return this.invoiceService.getInvoice(token, version, res);
  }

  // when we are implementing for a client then, we will use /for/clientId
  @Get('for')
  @Owner()
  getInvoiceForOrder(
    @Query('orderId') orderId: string,
    @GetOwnedCompany() company: Company,
  ) {
    return this.invoiceService.getInvoiceForOrder(orderId, company);
  }
}
