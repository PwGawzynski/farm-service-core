import { Test, TestingModule } from '@nestjs/testing';
import { FieldAddressService } from './field-address.service';

describe('FieldAddressService', () => {
  let service: FieldAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldAddressService],
    }).compile();

    service = module.get<FieldAddressService>(FieldAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
