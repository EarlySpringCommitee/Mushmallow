import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { ModulesService } from './modules.service';

@Module({
    controllers: [MusicController],
    providers: [ModulesService]
})
export class MusicModule {}
