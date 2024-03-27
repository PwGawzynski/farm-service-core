import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { Client, Owner } from '../../decorators/auth.decorators';
import { CreateFieldDto } from './dto/create-field.dto';
import { GetDataFromXLMDto } from './dto/get-dataFromXLM.dto';
import { GetUser } from '../../decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateFieldDto } from './dto/update-field.dto';

//@ApiTags('Field')
@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post()
  @Owner()
  @Client()
  async create(@Body() createFieldDto: CreateFieldDto, @GetUser() user: User) {
    return this.fieldService.create(createFieldDto, user);
  }
  @Put('edit')
  @Owner()
  @Client()
  async edit(@Body() updateFieldDto: UpdateFieldDto, @GetUser() user: User) {
    return this.fieldService.edit(updateFieldDto, user);
  }

  @Post('xmlTranslate')
  @Owner()
  async getDataFromXLM(@Body() xlm: GetDataFromXLMDto) {
    return this.fieldService.getDataFromXLM(xlm);
  }

  @Get('PLID')
  @Owner()
  async getOnePLId(@Query('PLid') PLid: string) {
    return this.fieldService.getOnePlId(PLid);
  }

  @Get('all')
  @Owner()
  async getAll(@Query('client') client: string) {
    return this.fieldService.getAllByClient(client);
  }

  @Get()
  @Owner()
  async getOne(@Query('id') id: string) {
    return this.fieldService.getOne(id);
  }

  @Delete()
  @Owner()
  async delete(@Query('id') id: string) {
    return this.fieldService.delete(id);
  }

  /*@Get('all-for-order')
  @AllRoles()
  async getAllFields(
    @Query('id') id: string,
    @GetOwnedCompany() company: Company,
  ) {
    return this.fieldService.getAllFields(company, id);
  }*/
}
