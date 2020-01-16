import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalPlaylist, LocalPlaylistData } from './local.entity';

@Module({
    providers: [LocalService],
    exports: [LocalService],
    imports: [
        TypeOrmModule.forFeature([LocalPlaylist]),
        TypeOrmModule.forFeature([LocalPlaylistData])
    ]
})
export class LocalModule {}
