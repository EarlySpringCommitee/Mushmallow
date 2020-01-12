import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { ModulesService } from './modules.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [MusicController],
    providers: [ModulesService],
    imports: [ConfigModule.forRoot()]
})
export class MusicModule {}
