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

export interface IMusicService {
    getMusic: (id: ID) => Promise<MusicResult>;
    isMusicAvailable(id: ID): Promise<boolean>;
    getMusicURL(id: ID, quality: Quality): Promise<URLResult>;
}
