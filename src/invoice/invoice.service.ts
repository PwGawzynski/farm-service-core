import { ConflictException, Injectable } from '@nestjs/common';
import { Order } from '../order/entities/order.entity';
import { Invoice } from './entities/invoice.entity';
import { Task } from '../task/entities/task.entity';
import { InvoiceRecord } from './entities/invoice-record.entity';
import { TaskType } from '../../FarmServiceApiTypes/Task/Enums';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import { Response } from 'express';
import { PreparePdfInvoice } from './PdfGenerator/pdf-gen';
import {
  InvoiceLanguage,
  InvoiceRecordJM,
} from '../../FarmServiceApiTypes/InvoiceEntity/Enums';
import { Equal } from 'typeorm';
import { InvoiceRecordData } from '../../internalTypes/InvoiceRecord/types';
import { Company } from '../company/entities/company.entity';
import { InvoiceResponseDto } from './dot/response/invoice-response.dto';
import { GetIp } from '../../Helpers/GetIp';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';

@Injectable()
export class InvoiceService {
  // 1 HEX = 2 characters
  private generateAccessToken(length = 100) {
    return crypto.randomBytes(length).toString('hex');
  }
  _prepareResponse(invoice: Invoice) {
    return new InvoiceResponseDto({
      number: invoice.number,
      invoiceDownloadLink: `http://${GetIp()}:3006/invoice/?token=${
        invoice.publicAccessToken
      }`,
      issueDate: invoice.issueDate.toISOString(),
    });
  }

  /**
   * Perform validation and get invoice from database
   * @param token - public access token
   * @param res - express response object
   * @private
   */
  private async getStored(token: string, res: Response) {
    const invoice = await Invoice.findOne({
      where: { publicAccessToken: token },
      relations: ['client', 'company'],
    });
    if (!invoice) {
      res.status(404).send('Invoice not found');
      throw new Error('Invoice not found');
    }
    const records = await InvoiceRecord.find({
      where: {
        invoice: { id: Equal(invoice.id) },
      },
    });

    if (!records) res.status(404).send('Invoice has no records');

    return { invoice, records };
  }

  /**
   * ---------------------------------SERVICES----------------------------------
   */

  private async saveInvoiceRecords(
    task: Task[],
    order: Order,
    invoice: Invoice,
  ) {
    const pricing = await order.prices;
    const records = new Map<TaskType, InvoiceRecordData>();

    for (const t of task) {
      const taskPricing = pricing?.find((p) => p.taskType === t.type);
      if (!taskPricing) {
        throw new Error('Task pricing not found');
      }

      const netValue = taskPricing.price * (await t.field).area;
      const taxValue = netValue * taskPricing.tax;
      const grossValue = netValue + taxValue;
      const existingRecord = records.get(t.type);

      if (existingRecord) {
        existingRecord.netValue += netValue;
        existingRecord.taxValue += taxValue;
        existingRecord.grossValue += grossValue;
        existingRecord.count += 1;
      } else {
        records.set(t.type, {
          netValue,
          taxValue,
          grossValue,
          count: 1,
          pricePerUnit: taskPricing.price,
          jm: InvoiceRecordJM.HA,
          tax: taskPricing.tax,
        });
      }
    }
    return await Promise.all(
      Array.from(records.entries()).map(async ([taskType, record]) => {
        const invoiceRecord = new InvoiceRecord({
          netValue: record.netValue,
          taxValue: record.taxValue,
          grossValue: record.grossValue,
          count: record.count,
          pricePerJm: record.pricePerUnit,
          jm: record.jm,
          tax: record.tax,
          name: TaskType[taskType],
          invoice: Promise.resolve(invoice),
        });
        return invoiceRecord.save();
      }),
    );
  }

  // ADD VALIDATION IF IT WILL BE USED WITH CONTROLLER
  async create(order: Order, tasks: Task[]) {
    const client = await order.client;
    const company = await order.company;
    const orderTasks = (await order.tasks)?.filter((t) =>
      tasks.some((tt) => tt.id === t.id),
    );
    if (!orderTasks) throw new ConflictException('Order has no tasks');

    const invoiceNr = `${new Date().getDate()}/${new Date().getMonth() + 1}/${
      uuid().split('-')[4]
    }`;

    const invoice = new Invoice({
      fileName: `${order.name}-invoice`,
      number: invoiceNr,
      publicAccessToken: this.generateAccessToken(),
      order: order,
      client: client,
      company: company,
    });
    try {
      await invoice.save();
      await this.saveInvoiceRecords(orderTasks, order, invoice);
      return invoice;
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Invoice already exists');
      }
      throw e;
    }
  }

  async getInvoice(
    token: string,
    version: InvoiceLanguage = InvoiceLanguage.PL,
    res: Response,
  ) {
    const { invoice, records } = await this.getStored(token, res);

    const clientPersonalData = await invoice.client.user.personalData;
    const companyAddress = await invoice.company.address;
    const clientCompany = await invoice.client.company;
    const clientCompanyAddress = await clientCompany?.address;
    const company = invoice.company;

    const pdf = PreparePdfInvoice(
      invoice,
      records,
      company,
      clientPersonalData,
      companyAddress,
      version,
      clientCompany,
      clientCompanyAddress,
    );
    pdf.pipe(res);
    pdf.end();
  }

  async getInvoiceForOrder(orderId: string, company: Company) {
    const invoices = await Invoice.find({
      where: {
        order: { id: Equal(orderId) },
        company: { id: Equal(company.id) },
      },
    });
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: invoices.map((i) => this._prepareResponse(i)),
    } as ResponseObject<InvoiceResponseDto[]>;
  }
}
