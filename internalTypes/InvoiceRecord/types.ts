import { InvoiceRecordJM } from '../../FarmServiceApiTypes/InvoiceEntity/Enums';

export interface InvoiceRecordData {
  netValue: number;
  taxValue: number;
  grossValue: number;
  count: number;
  pricePerUnit: number;
  jm: InvoiceRecordJM;
  tax: number;
}
