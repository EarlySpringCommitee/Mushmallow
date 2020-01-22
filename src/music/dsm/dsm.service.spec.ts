import { Test, TestingModule } from '@nestjs/testing';
import { DsmService } from './dsm.service';

describe('DsmService', () => {
  let service: DsmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DsmService],
    }).compile();

    service = module.get<DsmService>(DsmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
