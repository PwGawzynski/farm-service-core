import { Test, TestingModule } from '@nestjs/testing';
import { ClientsCompanyController } from './clients_company.controller';
import { ClientsCompanyService } from './clients_company.service';

describe('ClientsCompanyController', () => {
  let controller: ClientsCompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsCompanyController],
      providers: [ClientsCompanyService],
    }).compile();

    controller = module.get<ClientsCompanyController>(ClientsCompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
