import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldAddress } from '../../field-address/entities/field-address.entity';
import { ConflictException } from '@nestjs/common';
import FieldConstants from '../../../FarmServiceApiTypes/Field/Constants';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Field extends BaseEntity {
  constructor(options?: Partial<Field>) {
    super();
    if (options) {
      Object.assign(this, options);
    }
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: FieldConstants.POLISH_ID_MAX_LEN,
    nullable: false,
    name: 'polish_system_id',
  })
  @Index('UNIQ_POLISH_SYSTEM_ID', { unique: true })
  polishSystemId: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: FieldConstants.AREA_MAX_DECIMAL_PLACES,
    unsigned: true,
    nullable: false,
  })
  area: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'date_of_collection_data',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateOfCollectionData: Date;

  @Column({
    type: 'varchar',
    length: FieldConstants.NAME_MAX_LEN,
    nullable: false,
  })
  nameLabel: string;

  @OneToOne(() => FieldAddress, (fieldAddress) => fieldAddress.field, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'address_id' })
  address: Promise<FieldAddress>;

  @ManyToOne(() => User, (user: User) => user.createdFields, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  created_by: Promise<User>;

  @ManyToOne(() => User, (user: User) => user.ownedFields, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: Promise<User>;

  async _shouldNotExist() {
    const exist = await Field.findOne({
      where: {
        polishSystemId: this.polishSystemId,
      },
    });
    if (exist)
      throw new ConflictException(
        'Filed with given polishSystemId is already registered',
      );
  }
}
