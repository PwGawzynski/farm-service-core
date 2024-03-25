import { Test, TestingModule } from '@nestjs/testing';
import { FieldAddressController } from './field-address.controller';
import { FieldAddressService } from './field-address.service';

describe('FieldAddressController', () => {
  let controller: FieldAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldAddressController],
      providers: [FieldAddressService],
    }).compile();

    controller = module.get<FieldAddressController>(FieldAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
