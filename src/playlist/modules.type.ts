import { ID, Playlist } from './playlist.type';

import { ApiProperty } from '@nestjs/swagger';

export { LoginResult, ILoginService } from '../music/modules.type';

export enum PlaylistResultStatus {
    OK = 'OK',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND'
}

export class PlaylistResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    playlist?: Playlist;

    @ApiProperty()
    status?: PlaylistResultStatus;
}

export enum PlaylistSaveResultStatus {
    OK = 'OK',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
    MUSIC_NOT_FOUND = 'MUSIC_NOT_FOUND',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    UNKNOWN = 'UNKNOWN',
    MUSIC_NOT_SUPPORTED = 'MUSIC_NOT_SUPPORTED',
    PLAYLIST_NOT_SUPPORTED = 'PLAYLIST_NOT_SUPPORTED'
}

export class PlaylistSaveResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status?: PlaylistSaveResultStatus;
}

export interface IPlaylistService {
    getPlaylist: (id: ID) => Promise<PlaylistResult>;
    save?: (song: ID, playlist: ID) => Promise<PlaylistSaveResult>;
    delete?: (song: ID, playlist: ID) => Promise<PlaylistSaveResult>;
}
