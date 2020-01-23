import { ID, Playlist } from './playlist.type';
export { ID, Playlist } from './playlist.type';

import { ApiProperty } from '@nestjs/swagger';

export { LoginResult, ILoginService } from '../music/modules.type';

export enum PlaylistResultStatus {
    OK = 'OK',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MODULE_NOT_SUPPORTED = 'MODULE_NOT_SUPPORTED'
}

export class PlaylistResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    playlist?: Playlist;

    @ApiProperty()
    status?: PlaylistResultStatus;
}

export class PlaylistsResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    playlist?: Playlist[];

    @ApiProperty()
    status?: PlaylistsResultStatus;
}

export enum PlaylistsResultStatus {
    OK = 'OK'
}

export enum PlaylistSaveResultStatus {
    OK = 'OK',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
    MUSIC_NOT_FOUND = 'MUSIC_NOT_FOUND',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MUSIC_NOT_SUPPORTED = 'MUSIC_NOT_SUPPORTED',
    PLAYLIST_NOT_SUPPORTED = 'PLAYLIST_NOT_SUPPORTED'
}

export class PlaylistSaveResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: PlaylistSaveResultStatus;
}

export enum PlaylistCreateResultStatus {
    OK = 'OK',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MODULE_NOT_SUPPORTED = 'MODULE_NOT_SUPPORTED'
}

export class PlaylistCreateResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: PlaylistCreateResultStatus;

    @ApiProperty()
    id?: ID['id'];
}

export enum PlaylistDeleteResultStatus {
    OK = 'OK',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MODULE_NOT_SUPPORTED = 'MODULE_NOT_SUPPORTED',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND'
}
export class PlaylistDeleteResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: PlaylistDeleteResultStatus;
}

export enum FavoritePlaylistSaveResultStatus {
    OK = 'OK',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND'
}
export class FavoritePlaylistSaveResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: FavoritePlaylistSaveResultStatus;

    @ApiProperty()
    id?: number;
}

export enum FavoritePlaylistResultStatus {
    OK = 'OK',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class FavoritePlaylistResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: FavoritePlaylistResultStatus;

    @ApiProperty()
    data?: ID[];
}

export enum FavoritePlaylistDeleteResultStatus {
    OK = 'OK',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED'
}

export class FavoritePlaylistDeleteResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    status: FavoritePlaylistDeleteResultStatus;
}

export interface IPlaylistService {
    getPlaylist: (id: ID) => Promise<PlaylistResult>;
    save?: (song: ID, playlist: ID) => Promise<PlaylistSaveResult>;
    delete?: (song: ID, playlist: ID) => Promise<PlaylistSaveResult>;
    getPlaylists?: (option: any) => Promise<PlaylistsResult>;
    createPlaylist?: (data: any) => Promise<PlaylistCreateResult>;
    deletePlaylist?: (id: ID) => Promise<PlaylistDeleteResult>;
    getAlbum?: (id: ID) => Promise<PlaylistResult>;
}
