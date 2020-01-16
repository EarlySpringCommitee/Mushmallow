import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { LocalModule } from './local/local.module';

@Module({
    controllers: [PlaylistController],
    providers: [PlaylistService],
    imports: [LocalModule]
})
export class PlaylistModule {}
