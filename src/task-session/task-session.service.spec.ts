import { Test, TestingModule } from '@nestjs/testing';
import { TaskSessionService } from './task-session.service';

describe('TaskSessionService', () => {
  let service: TaskSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskSessionService],
    }).compile();

    service = module.get<TaskSessionService>(TaskSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
