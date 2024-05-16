import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccountingResponseDto {
  constructor(partial: Partial<AccountingResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  invoiceDownloadLink: string;
}
