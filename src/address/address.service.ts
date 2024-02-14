import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { AddressResponseDto } from './dto/response/address.response.dto';

@Injectable()
export class AddressService {
  async update(updateData: UpdateAddressDto) {
    const { id, ...address } = updateData;
    const oldAddress = await Address.findOne({ where: { id } });
    if (!oldAddress) throw new BadRequestException('Address not exist');
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
