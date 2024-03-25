import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFieldDto } from './dto/create-field.dto';
import { Field } from './entities/field.entity';
import { FieldAddress } from '../field-address/entities/field-address.entity';
import { FieldResponseDto } from './dto/response/field.response';
import { FieldAddressResponseDto } from '../field-address/dto/response/field-address.response.dto';
import * as convert from 'xml-js';
import { HttpService } from '@nestjs/axios';
import { GetDataFromXLMDto } from './dto/get-dataFromXLM.dto';
import { DataFromXLMResponseDto } from './dto/response/dataFromXLM.dto';
import {
  ResponseCode,
  ResponseObject,
} from '../../FarmServiceApiTypes/Respnse/responseGeneric';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../../FarmServiceApiTypes/User/Enums';
import { Client } from '../clients/entities/client.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
/*const proj4 = require('proj4')*/ type DataObject = {
  type: 'text' | 'cdata' | string;
  text: string;
  cdata: string;
};
interface DataFromUldk {
  type: 'element' | string;
  name: 'Attribute' | string;
  attributes: { Name: string };
  elements: Array<DataObject>;
}

type ParsedDataFromApiI = {
  key:
    | 'Identyfikator działki'
    | 'Województwo'
    | 'Powiat'
    | 'Gmina'
    | 'Obręb'
    | 'Numer działki'
    | 'Pole pow. w ewidencji gruntów (ha)'
    | 'KW'
    | 'Grupa rejestrowa'
    | 'Oznaczenie użytku'
    | 'Oznaczenie konturu'
    | 'Data publikacji danych'
    | 'Informacje o pochodzeniu danych'
    | 'Informacje dodatkowe o działce'
    | 'Kod QR'
    | string;
  value: string;
};

@Injectable()
export class FieldService {
  constructor(private readonly httpService: HttpService) {}
  private async _getFiledArea(data: string) {
    const parsedDataFromApi: Array<ParsedDataFromApiI> = (
      convert.xml2js(data).elements[0].elements[0].elements[0]
        .elements as Array<DataFromUldk>
    )
      .map((integrationLayerAttribute) => ({
        value:
          integrationLayerAttribute.elements &&
          (integrationLayerAttribute.elements[0].text ||
            integrationLayerAttribute.elements[0].cdata),
        key: integrationLayerAttribute.attributes.Name,
      }))
      .filter((processedData) => processedData.value);

    const area = parsedDataFromApi.find(
      (v) => v.key === 'Pole pow. w ewidencji gruntów (ha)',
    )?.value;
    const dateOfCollectionData = parsedDataFromApi.find(
      (v) => v.key === 'Data publikacji danych',
    )?.value;
    const county = parsedDataFromApi.find((v) =>
      v.key.includes('Powiat'),
    )?.value;
    const city = parsedDataFromApi.find((v) => v.key.includes('Gmina'))?.value;
    const voivodeship = parsedDataFromApi.find((v) =>
      v.key.includes('Województwo'),
    )?.value;
    const polishSystemId = parsedDataFromApi.find((v) =>
      v.key.includes('Identyfikator działki'),
    )?.value;

    return {
      area: Number(area),
      dateOfCollectionData: new Date(dateOfCollectionData || Date.now()),
      county,
      city,
      voivodeship,
      polishSystemId,
    };
  }

  private async _prepareResponsePayload(
    filed: Field,
    filedAddress: FieldAddress,
  ) {
    // filed.address = undefined;
    return new FieldResponseDto({
      ...filed,
      address: new FieldAddressResponseDto(filedAddress),
    });
  }

  private async _prepareResponse(filed: Field, filedAddress: FieldAddress) {
    // filed.address = undefined;
    return {
      code: ResponseCode.ProcessedWithoutConfirmationWaiting,
      payload: await this._prepareResponsePayload(filed, filedAddress),
    } as ResponseObject<FieldResponseDto>;
  }

  // because api access is restricted for request count this logic has been moved to front-end
  /*private async _getPlodId(
    latitude: number,
    longitude: number,
  ): Promise<string | false> {
    // in case of issues check returning value from below
    // returning data format is status\nIDField\n that's why i use split to split to array data and then check if response is ok
    const plotId = (
      (
        await this.httpService.axiosRef.get(
          `https://uldk.gugik.gov.pl/?request=GetParcelByXY&xy=${latitude},${longitude}&result=teryt`,
        )
      ).data as unknown as string
    ).split('\n') as [string, string];
    console.log(plotId, 'tescik');
    return !isNaN(Number(plotId[0])) && Number(plotId[0]) !== -1
      ? plotId[1]
      : false;
  }*/

  /*private _transformCords(data: CreateFieldAddressDto) {
    proj4.defs(
      'EPSG:2180',
      '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs',
    );

    const src_crs = 'WGS84';

    const dst_crs = 'EPSG:2180';

    return proj4(proj4.defs(src_crs), proj4.defs(dst_crs), [
      Number(data.longitude),
      Number(data.latitude),
    ]);
  }*/

  private async _validateFieldCreation(
    field: Field,
    user: User,
    client: Client | undefined,
  ) {
    await field._shouldNotExist();
    if (user.role == UserRole.Owner && !client)
      throw new ConflictException('Cannot create field without client data');
    else if (user.role == UserRole.Owner && client) {
      const clients = await (await user.company)?.clients;
      const clientExists = clients?.find((c) => c.id === client?.id);
      if (!clientExists)
        throw new ConflictException('Cannot find client within yours clients');
    }
  }

  async create(createFieldDto: CreateFieldDto, user: User) {
    const filedAddress = new FieldAddress({ ...createFieldDto.address });
    const newField = new Field({
      ...createFieldDto,
      address: Promise.resolve(filedAddress),
    });
    await this._validateFieldCreation(newField, user, createFieldDto.client);
    await filedAddress.save();
    newField.address = Promise.resolve(filedAddress);

    // due to method can be used by owner and client, if client is provided, then field is assigned to client
    if (user.role === UserRole.Owner && createFieldDto.client)
      newField.owner = Promise.resolve(createFieldDto.client.user);
    else if (user.role === UserRole.Client)
      newField.owner = Promise.resolve(user);

    newField.created_by = Promise.resolve(user);

    await newField.save();
    filedAddress.field = Promise.resolve(newField);
    filedAddress.save();

    return this._prepareResponse(newField, filedAddress);
  }

  async getOnePlId(PLid: string) {
    const field = await Field.findOne({
      where: { polishSystemId: PLid },
    });
    if (!field) throw new NotFoundException('Cannot find field with given id');
    return this._prepareResponse(field, await field.address);
  }

  async getOne(id: string) {
    const field = await Field.findOne({
      where: { id },
    });
    if (!field) throw new NotFoundException('Cannot find field with given id');
    return this._prepareResponse(field, await field.address);
  }

  /*async getAllFields(company: Company, orderId: string) {
    const order = (await company.orders).find((o) => o.id === orderId);
    if (!order) {
      throw new ConflictException('Given order does not exist in your company');
    }
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await Promise.all(
        (
          await order.fields
        ).map(
          async (field) =>
            new FieldResponseDto({
              ...field,
              address: new FieldAddressResponseDto(await field.address),
            }),
        ),
      ),
    } as ResponseObject<FieldResponseDto[]>;
  }*/

  async getDataFromXLM(xlm: GetDataFromXLMDto) {
    const data = await this._getFiledArea(xlm.data);
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: new DataFromXLMResponseDto(data),
    } as ResponseObject<DataFromXLMResponseDto>;
  }

  async delete(id: string) {
    const field = await Field.findOne({
      where: { id },
    });
    if (!field) throw new NotFoundException('Cannot find field with given id');
    field.remove();
    return {
      code: ResponseCode.ProcessedCorrect,
    } as ResponseObject;
  }

  async getAllByClient(id: string) {
    if (id === undefined)
      throw new NotFoundException('Cannot find client with given id');
    const client = await Client.findOne({
      where: { id },
    });
    if (!client)
      throw new NotFoundException('Cannot find client with given id');
    const fields = await (await client.user).ownedFields;
    return {
      code: ResponseCode.ProcessedCorrect,
      payload: await Promise.all(
        fields.map(async (field) =>
          this._prepareResponsePayload(field, await field.address),
        ),
      ),
    } as ResponseObject<FieldResponseDto[]>;
  }
}
