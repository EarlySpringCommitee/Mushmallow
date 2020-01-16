import { Module } from '@nestjs/common';
import { LyricController } from './lyric.controller';
import { LyricService } from './lyric.service';

@Module({
    controllers: [LyricController],
    providers: [LyricService]
})
export class LyricModule {}
