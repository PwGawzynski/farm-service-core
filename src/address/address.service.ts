import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { AddressResponseDto } from './dto/response/address.response.dto';
import { Equal } from 'typeorm';
import { ErrorPayloadObject } from '../../FarmServiceApiTypes/Respnse/errorPayloadObject';
import { InvalidRequestCodes } from '../../FarmServiceApiTypes/InvalidRequestCodes';

@Injectable()
export class AddressService {
  async update(updateData: UpdateAddressDto) {
    const { id, ...address } = updateData;
    const oldAddress = await Address.findOne({ where: { id: Equal(id) } });
    if (!oldAddress)
      throw new NotFoundException({
        code: InvalidRequestCodes.address_notFound,
        message: 'Address not found',
      } as ErrorPayloadObject);
    Address.createQueryBuilder()
      .update(oldAddress)
      .set(address)
      .where('id=:id', { id })
      .execute();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new AddressResponseDto({
        ...address,
      }),
    } as ResponseObject<AddressResponseDto>;
  }
}
