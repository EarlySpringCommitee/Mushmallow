import { Music, ID, Quality } from './music.type';

export interface LoginResult {
    success: boolean;
    message?: any;
}

export interface ILoginService<LoginInfo> {
    login: (info: LoginInfo) => Promise<LoginResult>;
}

export enum MusicResultStatus {
    OK,
    MODULE_NOT_FOUND,
    MUSIC_NOT_AVAILABLE
}

export interface MusicResult {
    success: boolean;
    music?: Music;
    message?: string;
    status: MusicResultStatus;
}

export interface URLResult {
    success: boolean;
    url?: string;
    status?: MusicResultStatus;
}

export interface IMusicService {
    getMusic: (id: ID) => Promise<MusicResult>;
    isMusicAvailable(id: ID): Promise<boolean>;
    getMusicURL(id: ID, quality: Quality): Promise<URLResult>;
}
