const MODULE_NAME = 'netease';

import * as request from 'request-promise-native';
const rp = request.defaults({
    jar: request.jar(),
    json: true
});

import {
    LoginResult,
    ILoginService,
    IMusicService,
    MusicResult,
    MusicResultStatus,
    URLResult,
    MusicsResult,
    MusicsResultStatus
} from '../modules.type';
import { Music, ID, Quality, Album, Artist } from '../music.type';

interface NeteasePhoneLoginInfo {
    phone: String;
    password: String;
}

interface NeteaseEmailLoginInfo {
    email: String;
    password: String;
}

enum NQuality {
    LOW = 128000,
    MEDIUM = 192000,
    HIGH = 320000,
    VERY_HIGH = 320000,
    ORIGINAL = 999000
}

export class NeteaseService
    implements ILoginService<NeteasePhoneLoginInfo | NeteaseEmailLoginInfo>, IMusicService {
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

    async isMusicAvailable(id: ID): Promise<boolean> {
        try {
            const result = await rp(`${this.baseURL}/check/music?id=${id.id}`);
            return result.success;
        } catch (e) {
            return false;
        }
    }

    async getMusic(id: ID): Promise<MusicResult> {
        const song = (await rp(`${this.baseURL}/song/detail?ids=${id.id}`)).songs[0];

        const album: Album = {
            id: {
                module: MODULE_NAME,
                id: song.al.id
            },
            name: song.al.name,
            image: song.al.picUrl
        };

        const artist: Artist[] = song.ar.map((ar: { id: number; name: string }) => ({
            id: {
                module: MODULE_NAME,
                id: ar.id
            },
            name: ar.name
        }));

        const music: Music = {
            id: {
                module: MODULE_NAME,
                id: song.id
            },
            name: song.name,
            artist,
            album
        };

        return {
            success: true,
            status: MusicResultStatus.OK,
            music
        };
    }

    async getMusicURL(id: ID, quality: Quality): Promise<URLResult> {
        quality = quality in Quality ? quality : Quality.ORIGINAL;
        const br = NQuality[Quality[quality]];
        try {
            const result = (await rp(`${this.baseURL}/song/url?id=${id.id}&br=${br}`)).data[0];
            return {
                success: result.url,
                url: result.url.replace('http:', 'https:'),
                status: MusicResultStatus.OK
            };
        } catch (e) {
            return {
                success: false,
                status: MusicResultStatus.MUSIC_NOT_AVAILABLE
            };
        }
    }

    async searchMusic(moduleName: string, keyword: string): Promise<MusicsResult> {
        try {
            const result = await rp(`${this.baseURL}/search?keywords=${keyword}`);
            if (result.code !== 200) throw new Error(MusicsResultStatus.UNKNOWN_ERROR);
            return {
                success: true,
                status: MusicsResultStatus.OK,
                data: result.result.songs.map((song: any) => {
                    const album: Album = {
                        id: {
                            module: MODULE_NAME,
                            id: song.album.id
                        },
                        name: song.album.name
                    };

                    const artist: Artist[] = song.artists.map(
                        (ar: { id: number; name: string }) => ({
                            id: {
                                module: MODULE_NAME,
                                id: ar.id
                            },
                            name: ar.name
                        })
                    );

                    const music: Music = {
                        id: {
                            module: MODULE_NAME,
                            id: song.id
                        },
                        name: song.name,
                        artist,
                        album
                    };

                    return music;
                })
            };
        } catch (e) {
            switch (e.message) {
                default:
                    return {
                        success: false,
                        status: MusicsResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }
}
