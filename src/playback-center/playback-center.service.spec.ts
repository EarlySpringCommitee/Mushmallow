import { Test, TestingModule } from '@nestjs/testing';
import { PlaybackCenterService } from './playback-center.service';

describe('PlaybackCenterService', () => {
  let service: PlaybackCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaybackCenterService],
    }).compile();

    service = module.get<PlaybackCenterService>(PlaybackCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
