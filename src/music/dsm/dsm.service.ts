import { Injectable } from '@nestjs/common';

import * as request from 'request-promise-native';
const jar = request.jar();
const rp = request.defaults({
    jar,
    json: true
});
const rpp = request.defaults({ jar, encoding: null });

import {
    LoginResult,
    ILoginService,
    IMusicService,
    MusicResult,
    MusicResultStatus,
    URLResult,
    MusicsResult,
    MusicsResultStatus,
    BasicLoginInfo
} from '../modules.type';
import { Music, ID, Quality, Album, Artist } from '../music.type';

import { Response } from 'express';

const MODULE_NAME = 'dsm';

@Injectable()
export class DsmService implements ILoginService {
    constructor(
        private readonly dsmURL: string = process.env.DSM_URL,
        private readonly loginInfo: BasicLoginInfo = {
            username: process.env.DSM_USERNAME,
            password: process.env.DSM_PASSWORD
        }
    ) {}

    private getAPI(
        cgi: string,
        api: string,
        method: string,
        params: { [key: string]: string | number } = {},
        version = 1
    ) {
        const paramsString = Object.entries(params).reduce(
            (prev, cur) => prev + `&${cur[0]}=${encodeURIComponent(cur[1])}`,
            ''
        );
        return rp(
            `${this.dsmURL}/webapi/${cgi}?api=${api}&method=${method}&version=${version}${paramsString}`
        );
    }

    private postAPI(
        cgi: string,
        api: string,
        method: string,
        params: { [key: string]: string } = {},
        version = 3
    ) {
        const form = Object.assign(
            {
                api,
                method,
                version
            },
            params
        );
        return rp(`${this.dsmURL}/webapi/${cgi}`, {
            form
        });
    }

    async login(): Promise<LoginResult> {
        const result = await this.getAPI('auth.cgi', 'SYNO.API.Auth', 'Login', {
            account: this.loginInfo.username,
            passwd: this.loginInfo.password,
            session: 'AudioStation',
            format: 'cookie'
        });
        if (result.success) {
            return {
                success: true
            };
        } else {
            return {
                success: false,
                message: result
            };
        }
    }

    private getProxyURL(data: { [key: string]: string } = {}) {
        const url = `/music/proxy?module=${MODULE_NAME}`;
        return Object.entries(data).reduce(
            (prev, cur) => prev + `&${encodeURIComponent(cur[0])}=${encodeURIComponent(cur[1])}`,
            url
        );
    }

    async getMusic(id: ID): Promise<MusicResult> {
        const music = new Music();
        music.id = id;
        let result = await this.getAPI(
            'AudioStation/song.cgi',
            'SYNO.AudioStation.Song',
            'getinfo',
            { id: id.id },
            3
        );
        if (result.success) {
            music.image = this.getProxyURL({
                method: 'cover',
                type: 'song',
                id: id.id
            });

            const info = result.data.songs[0];
            music.name = info.title;
            const path = info.path;

            const result2 = await rp(
                `${this.dsmURL}/webman/3rdparty/AudioStation/tagEditorUI/tag_editor.cgi`,
                {
                    method: 'POST',
                    form: {
                        action: 'load',
                        audioInfos: JSON.stringify([
                            {
                                path
                            }
                        ]),
                        requestFrom: ''
                    }
                }
            );

            if (result2.files && result2.files.length === 1) {
                if (result2.artist) {
                    music.artist = [new Artist()];
                    music.artist[0].id = {
                        module: MODULE_NAME,
                        id: result2.artist
                    };
                    music.artist[0].name = result2.artist;
                    music.artist[0].image = this.getProxyURL({
                        method: 'cover',
                        type: 'artist',
                        name: result2.artist
                    });
                }
                if (result2.album) {
                    music.album = new Album();
                    music.album.id = {
                        module: MODULE_NAME,
                        id: result2.album
                    };
                    music.album.name = result2.album;
                    music.album.image = this.getProxyURL({
                        method: 'cover',
                        type: 'album',
                        name: result2.album
                    });
                }

                return {
                    success: true,
                    status: MusicResultStatus.OK,
                    music
                };
            }
        }
    }

    async isMusicAvailable(id: ID) {
        return true;
    }

    async getMusicURL(id: ID, _: Quality) {
        return {
            success: true,
            status: MusicResultStatus.OK,
            url: this.getProxyURL({
                method: 'song',
                id: id.id
            })
        };
    }

    async searchMusic(_, keyword) {
        try {
            const result = await this.getAPI(
                'AudioStation/search.cgi',
                'SYNO.AudioStation.Search',
                'list',
                {
                    additional: 'song_tag,song_audio,song_rating',
                    library: 'shared',
                    limit: 50,
                    sort_by: 'title',
                    sort_direction: 'ASC',
                    keyword
                },
                1
            );

            return {
                success: true,
                status: MusicsResultStatus.OK,
                data: result.songs.map(x => ({
                    id: {
                        module: MODULE_NAME,
                        id: x.id
                    },
                    name: x.title,
                    artist: [
                        {
                            id: {
                                module: MODULE_NAME,
                                id: x.additional.song_tag.artist
                            },
                            image: this.getProxyURL({
                                method: 'cover',
                                type: 'artist',
                                name: x.additional.song_tag.artist
                            }),
                            name: x.additional.song_tag.artist
                        }
                    ],
                    album: {
                        id: {
                            module: MODULE_NAME,
                            id: x.additional.song_tag.album
                        },
                        name: x.additional.song_tag.album,
                        image: this.getProxyURL({
                            method: 'cover',
                            type: 'album',
                            name: x.additional.song_tag.album
                        })
                    },
                    image: this.getProxyURL({
                        method: 'cover',
                        type: 'song',
                        id: x.id
                    })
                }))
            };
        } catch (e) {
            return {
                success: false,
                status: MusicsResultStatus.UNKNOWN_ERROR
            };
        }
    }

    async proxy(_, data, headers, res: Response) {
        const imageUrl = `${this.dsmURL}/webapi/AudioStation/cover.cgi?api=SYNO.AudioStation.Cover&output_default=true&is_hr=false&version=3&library=shared&method=getcover&view=default`;
        switch (data.method) {
            case 'cover':
                res.set('Content-Type', 'image/png');
                switch (data.type) {
                    case 'song':
                        return res.send(
                            await rpp.get(
                                `${this.dsmURL}/webapi/AudioStation/cover.cgi?api=SYNO.AudioStation.Cover&output_default=true&is_hr=false&version=3&library=shared&method=getsongcover&view=large&id=${data.id}`
                            )
                        );
                    case 'artist':
                        return res.send(
                            await rpp.get(
                                imageUrl + `&artist_name=${encodeURIComponent(data.name)}`
                            )
                        );
                    case 'album':
                        return res.send(
                            await rpp.get(imageUrl + `&album_name=${encodeURIComponent(data.name)}`)
                        );
                }
                break;
            case 'song':
                rpp.get({
                    url: `${this.dsmURL}/webapi/AudioStation/stream.cgi/0.mp3?api=SYNO.AudioStation.Stream&version=2&method=stream&id=${data.id}`,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
                        Range: headers.range,
                        Accept: headers.accept,
                        Host: new URL(this.dsmURL).host
                    }
                }).pipe(res, { end: true });
        }
    }
}
