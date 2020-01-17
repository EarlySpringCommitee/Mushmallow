import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { LocalModule } from './local/local.module';
import { FavoritePlaylist } from './playlist.entity';

@Module({
    controllers: [PlaylistController],
    providers: [PlaylistService],
    imports: [LocalModule, TypeOrmModule.forFeature([FavoritePlaylist])]
})
export class PlaylistModule {}
