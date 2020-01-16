import { Test, TestingModule } from '@nestjs/testing';
import { LyricController } from './lyric.controller';

describe('Lyric Controller', () => {
  let controller: LyricController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LyricController],
    }).compile();

    controller = module.get<LyricController>(LyricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
