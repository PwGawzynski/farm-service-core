import { Controller, Get, ParseEnumPipe, Query, Res } from '@nestjs/common';
import { Public } from '../../decorators/auth.decorators';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';
import { InvoiceLanguage } from '../../FarmServiceApiTypes/InvoiceEntity/Enums';

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
}
