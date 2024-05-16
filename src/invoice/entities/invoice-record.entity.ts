import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InvoiceRecordJM } from '../../../FarmServiceApiTypes/InvoiceEntity/Enums';
import { Invoice } from './invoice.entity';

@Entity()
export class InvoiceRecord extends BaseEntity {
  constructor(props?: Partial<InvoiceRecord>) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: InvoiceRecordJM,
    nullable: false,
  })
  jm: InvoiceRecordJM;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 0,
    nullable: false,
  })
  count: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  tax: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  pricePerJm: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  netValue: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  taxValue: number;

  @Column({
    type: 'numeric',
    scale: 2,
    precision: 10,
    nullable: false,
  })
  grossValue: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.records, { nullable: false })
  invoice: Promise<Invoice>;
}
