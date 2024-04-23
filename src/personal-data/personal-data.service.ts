import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePersonalDataDto } from './dto/update-personal-data.dto';
import { PersonalData } from './entities/personalData.entity';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { PersonalDataResponseDto } from './dto/response/personalData-response.dto';
import { Equal } from 'typeorm';

@Injectable()
export class PersonalDataService {
  async update(updateData: UpdatePersonalDataDto) {
    const { id, name, surname, phoneNumber } = updateData;
    const oldPersonalData = await PersonalData.findOne({
      where: { id: Equal(id) },
    });
    if (!oldPersonalData)
      throw new BadRequestException('Cannot Find personal data');

    const newPersonalData = new PersonalData({
      name,
      surname,
      phoneNumber: phoneNumber,
    });
    console.log(phoneNumber, oldPersonalData.phoneNumber);
    if (oldPersonalData.phoneNumber !== phoneNumber)
      await newPersonalData._shouldNotExist(
        'phoneNumber',
        'Phone number is already in use',
      );
    // noinspection ES6MissingAwait
    PersonalData.createQueryBuilder()
      .update(oldPersonalData)
      .set({
        phoneNumber: phoneNumber,
        name,
        surname,
      })
      .where('id = :id', { id })
      .execute();
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new PersonalDataResponseDto(newPersonalData),
    } as ResponseObject<PersonalDataResponseDto>;
  }
}
