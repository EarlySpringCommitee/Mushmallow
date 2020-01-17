import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { LyricService } from './lyric/lyric.service';
import { LyricModule } from './lyric/lyric.module';
import { PlaylistService } from './playlist/playlist.service';
import { PlaylistModule } from './playlist/playlist.module';
import { LocalModule } from './playlist/local/local.module';
import { LocalPlaylist, LocalPlaylistData } from './playlist/local/local.entity';
import { FavoritePlaylist } from './playlist/playlist.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_DATABASE || 'mushmallow',
            entities: [User, FavoritePlaylist, LocalPlaylist, LocalPlaylistData],
            synchronize: true
        }),
        MusicModule,
        AuthModule,
        UsersModule,
        LyricModule,
        LocalModule,
        PlaylistModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
