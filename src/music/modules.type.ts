import { Music, ID, Quality } from './music.type';

import { ApiProperty } from '@nestjs/swagger';

export interface LoginResult {
    success: boolean;
    message?: any;
}

export interface ILoginService<LoginInfo> {
    login: (info: LoginInfo) => Promise<LoginResult>;
}

export enum MusicResultStatus {
    OK = 'OK',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    MUSIC_NOT_AVAILABLE = 'MUSIC_NOT_AVAILABLE',
    QUALITY_NOT_AVAILABLE = 'QUALITY_NOT_AVAILABLE'
}

export class MusicResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    music?: Music;

    @ApiProperty()
    message?: string;

    @ApiProperty()
    status: MusicResultStatus;
}

export class URLResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    url?: string;

    @ApiProperty()
    status?: MusicResultStatus;
}

export enum MusicsResultStatus {
    OK = 'OK',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND'
}

export class MusicsResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    data?: Music[];

    @ApiProperty()
    status?: MusicsResultStatus;
}

export interface IMusicService {
    getMusic: (id: ID) => Promise<MusicResult>;
    isMusicAvailable: (id: ID) => Promise<boolean>;
    getMusicURL: (id: ID, quality: Quality) => Promise<URLResult>;
    searchMusic: (moduleName: string, keyword: string) => Promise<MusicsResult>;
}
