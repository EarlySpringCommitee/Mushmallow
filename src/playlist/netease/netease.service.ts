import { Injectable } from '@nestjs/common';

const MODULE_NAME = 'netease';

import * as request from 'request-promise-native';
const rp = request.defaults({
    jar: request.jar(),
    json: true
});

import { ID } from '../playlist.type';

import {
    LoginResult,
    ILoginService,
    IPlaylistService,
    PlaylistResult,
    PlaylistResultStatus,
    PlaylistSaveResult,
    PlaylistSaveResultStatus
} from '../modules.type';

interface NeteasePhoneLoginInfo {
    phone: String;
    password: String;
}

interface NeteaseEmailLoginInfo {
    email: String;
    password: String;
}

@Injectable()
export class NeteaseService
    implements ILoginService<NeteasePhoneLoginInfo | NeteaseEmailLoginInfo>, IPlaylistService {
    baseURL: String;
    loginResult?: LoginResult;

    constructor(baseURL: String) {
        this.baseURL = baseURL;
    }

    async login(info: NeteasePhoneLoginInfo | NeteaseEmailLoginInfo): Promise<LoginResult> {
        const type = 'phone' in info ? 'phone' : 'email';
        const result = await rp(
            `${this.baseURL}/login${type == 'phone' ? '/cellphone' : ''}?${type}=${
                info[type]
            }&password=${info.password}`
        );

        this.loginResult = result;

        return {
            success: result.code === 200,
            message: result
        };
    }

    async getPlaylist(id: ID): Promise<PlaylistResult> {
        try {
            const playlist = await rp(`${this.baseURL}/playlist/detail?id=${id.id}`);
            if (playlist.code !== 200) {
                throw new Error();
            }
            const IDs: ID[] = playlist.playlist.trackIds.map(
                (x: any): ID => ({
                    module: MODULE_NAME,
                    id: x.id
                })
            );
            return {
                success: true,
                playlist: {
                    module: MODULE_NAME,
                    data: IDs,
                    name: playlist.playlist.name
                },
                status: PlaylistResultStatus.OK
            };
        } catch (e) {
            return {
                success: false,
                status: PlaylistResultStatus.PLAYLIST_NOT_FOUND
            };
        }
    }

    private async playlistOp(
        song: ID,
        playlist: ID,
        op: 'add' | 'del'
    ): Promise<PlaylistSaveResult> {
        try {
            if (song.module !== MODULE_NAME) {
                throw new Error(PlaylistSaveResultStatus.MUSIC_NOT_SUPPORTED);
            }

            const result = await rp(
                `${this.baseURL}/playlist/tracks?op=${op}&pid=${playlist.id}&tracks=${song.id}`
            );

            if (result.code !== 200) {
                throw new Error(result.code.toString());
            }

            return {
                success: true,
                status: PlaylistSaveResultStatus.OK
            };
        } catch (e) {
            switch (e.message) {
                case '404':
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.PLAYLIST_NOT_FOUND
                    };
                    break;

                case '400':
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.MUSIC_NOT_FOUND
                    };
                    break;

                case '401':
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.UNAUTHORIZED
                    };
                    break;

                case PlaylistSaveResultStatus.MUSIC_NOT_SUPPORTED:
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.MUSIC_NOT_SUPPORTED
                    };
                    break;
                default:
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }

    async save(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        return await this.playlistOp(song, playlist, 'add');
    }

    async delete(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        return await this.playlistOp(song, playlist, 'del');
    }
}
