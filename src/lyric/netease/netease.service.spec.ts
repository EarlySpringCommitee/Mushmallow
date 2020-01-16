import { Test, TestingModule } from '@nestjs/testing';
import { NeteaseService } from './netease.service';

describe('NeteaseService', () => {
  let service: NeteaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeteaseService],
    }).compile();

    service = module.get<NeteaseService>(NeteaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
