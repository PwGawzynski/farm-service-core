import PdfPrinter from 'pdfmake';
import { Invoice } from '../entities/invoice.entity';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { InvoiceRecord } from '../entities/invoice-record.entity';
import { InvoiceLanguage } from '../../../FarmServiceApiTypes/InvoiceEntity/Enums';
import { PersonalData } from '../../personal-data/entities/personalData.entity';
import { Address } from '../../address/entities/address.entity';
import { ClientsCompany } from '../../clients_company/entities/clients_company.entity';
import { Company } from '../../company/entities/company.entity';

const textsPL = {
  invoice: 'FAKTURA VAT',
  invoiceNumber: 'FAKTURA ',
  serviceRecipient: 'USŁUGOBIORCA',
  serviceProvider: 'USŁUGODAWCA',
  serviceName: 'NAZWA USŁUGI',
  jm: 'J.M',
  quantity: 'ILOŚĆ',
  tax: 'PODATEK',
  netPricePerUnit: 'CENA JEDNOSTKOWA NETTO',
  netServiceValue: 'WARTOŚĆ USŁUGI NETTO',
  taxAmount: 'PODATEK KWOTA',
  grossServiceValue: 'WARTOŚĆ USŁUGI BRUTTO',
  sum: 'SUMA',
};

const textsEN = {
  invoice: 'INVOICE',
  invoiceNumber: 'INVOICE ',
  serviceRecipient: 'SERVICE RECIPIENT',
  serviceProvider: 'SERVICE PROVIDER',
  serviceName: 'SERVICE NAME',
  jm: 'J.M',
  quantity: 'QUANTITY',
  tax: 'TAX',
  netPricePerUnit: 'NET PRICE PER UNIT',
  netServiceValue: 'NET SERVICE VALUE',
  taxAmount: 'TAX AMOUNT',
  grossServiceValue: 'GROSS SERVICE VALUE',
  sum: 'SUM',
};
export function PreparePdfInvoice(
  invoice: Invoice,
  records: InvoiceRecord[],
  company: Company,
  clientPersonalData: PersonalData,
  companyAddress: Address,
  version: InvoiceLanguage,
  clientCompany?: ClientsCompany | null,
  clientCompanyAddress?: Address | null,
): PDFKit.PDFDocument {
  const isPolish = version === InvoiceLanguage.PL;
  const TITLES = isPolish ? textsPL : textsEN;
  const sum = records.reduce(
    (p, c) => ({
      netValue: p.netValue + Number(c.netValue),
      taxValue: p.taxValue + Number(c.taxValue),
      grossValue: p.grossValue + Number(c.grossValue),
    }),
    {
      netValue: 0,
      taxValue: 0,
      grossValue: 0,
    } as InvoiceRecord,
  );
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf',
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    header: {
      canvas: [
        {
          lineColor: '#081e3f',
          type: 'line',
          x1: -10,
          y1: 40,
          x2: 600,
          y2: 0,
          lineWidth: 100,
        },
      ],
    },
    footer: {
      canvas: [
        {
          lineColor: '#081e3f',
          type: 'line',
          x1: -10,
          y1: 40,
          x2: 600,
          y2: 0,
          lineWidth: 100,
        },
      ],
    },
    content: [
      {
        margin: [0, 100, 0, 0],
        fontSize: 16,
        bold: true,
        columns: [
          {
            text: TITLES.invoice,
          },
          {
            text: TITLES.invoiceNumber + invoice.number,
            alignment: 'right',
          },
        ],
      },
      {
        margin: [0, 20, 0, 0],
        columns: [
          {
            text: TITLES.serviceRecipient,
            fontSize: 12,
            bold: true,
          },
          {
            text: TITLES.serviceProvider,
            alignment: 'right',
            fontSize: 12,
            bold: true,
          },
        ],
      },
      {
        margin: [0, 0, 0, 20],
        columns: [
          {
            text: clientCompany
              ? `${clientPersonalData.name} ${clientPersonalData.surname}\n${
                  clientCompany?.name
                }\n${isPolish ? 'NIP: ' : 'TAX ID: '}${clientCompany?.NIP}\n${
                  clientCompanyAddress?.city
                }, ${clientCompanyAddress?.county}\n${
                  clientCompanyAddress?.voivodeship
                }\n${
                  (clientCompanyAddress && clientCompanyAddress?.street) ||
                  clientCompanyAddress?.city +
                    ' ' +
                    clientCompanyAddress?.houseNumber +
                    ' ' +
                    (clientCompanyAddress?.apartmentNumber || '')
                }`
              : `${clientPersonalData.name} ${clientPersonalData.surname}`,
            fontSize: 10,
          },
          {
            text: `${company.name}\n${isPolish ? 'NIP: ' : 'TAX ID: '}${
              company.NIP
            }\n${companyAddress?.city}, ${companyAddress?.county}\n${
              companyAddress?.voivodeship
            }\n${
              (companyAddress && companyAddress?.street) ||
              companyAddress?.city +
                ' ' +
                companyAddress?.houseNumber +
                ' ' +
                (companyAddress?.apartmentNumber || '')
            }`,
            alignment: 'right',
            fontSize: 10,
          },
        ],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: [
            [
              {
                alignment: 'center',
                text: TITLES.serviceName,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.jm,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.quantity,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.tax,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.netPricePerUnit,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.netServiceValue,
                bold: true,
                fontSize: 10,
              },

              {
                alignment: 'center',
                text: TITLES.taxAmount,
                bold: true,
                fontSize: 10,
              },
              {
                alignment: 'center',
                text: TITLES.grossServiceValue,
                bold: true,
                fontSize: 10,
              },
            ],

            ...records.map((record) => [
              { alignment: 'center', text: record.name, fontSize: 10 },
              { alignment: 'center', text: record.jm, fontSize: 10 },
              { alignment: 'center', text: record.count, fontSize: 10 },
              {
                alignment: 'center',
                text: (record.tax * 100).toFixed(2) + '%',
                fontSize: 10,
              },
              { alignment: 'center', text: record.pricePerJm, fontSize: 10 },
              { alignment: 'center', text: record.netValue, fontSize: 10 },
              { alignment: 'center', text: record.taxValue, fontSize: 10 },
              { alignment: 'center', text: record.grossValue, fontSize: 10 },
            ]),

            [
              {
                alignment: 'center',
                text: TITLES.sum,
                fontSize: 10,
                colSpan: 5,
                bold: true,
                fillColor: '#081e3f',
                color: '#ffffff',
                borderColor: '#ffffff',
              },
              {},
              {},
              {},
              {},
              {
                alignment: 'center',
                text: sum.netValue.toFixed(2),
                fontSize: 10,
                bold: true,
              },
              {
                alignment: 'center',
                text: sum.taxValue.toFixed(2),
                fontSize: 10,
                bold: true,
              },
              {
                alignment: 'center',
                text: sum.grossValue.toFixed(2),
                fontSize: 10,
                bold: true,
              },
            ],
          ],
        },
      },
    ],
    style: {
      header: {},
    },
  } as TDocumentDefinitions;

  const options = {
    // ...
  };

  return printer.createPdfKitDocument(docDefinition, options);
}
