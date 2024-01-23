import { Test, TestingModule } from '@nestjs/testing';
import { ClientsCompanyService } from './clients_company.service';

describe('ClientsCompanyService', () => {
  let service: ClientsCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientsCompanyService],
    }).compile();

    service = module.get<ClientsCompanyService>(ClientsCompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
