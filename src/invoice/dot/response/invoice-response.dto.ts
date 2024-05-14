import { Exclude, Expose } from 'class-transformer';

class InvoiceResponseDtoWhiteList {
  @Expose()
  number: string;
  @Expose()
  invoiceDownloadLink: string;
  @Expose()
  issueDate: string;
}

@Exclude()
export class InvoiceResponseDto extends InvoiceResponseDtoWhiteList {
  constructor(props: Partial<InvoiceResponseDto>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
