import { Injectable } from '@nestjs/common';

import { google, youtube_v3 } from 'googleapis';

import {
    IMusicService,
    MusicResult,
    MusicResultStatus,
    URLResult,
    MusicsResult,
    MusicsResultStatus
} from '../modules.type';
import { Music, ID, Artist, Quality } from '../music.type';

import * as youtubedl from 'youtube-dl';

function getURL(url: string, args: string[] = ['-f bestaudio']): Promise<string> {
    return new Promise((resolve, reject) => {
        youtubedl.getInfo(url, args, (err, info) => {
            if (err) reject(err);
            else resolve(info.url);
        });
    });
}

const MODULE_NAME = 'youtube';

@Injectable()
export class YoutubeService implements IMusicService {
    constructor(apiKey: string) {
        this.youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        });
    }
    private readonly youtube;

    private videoToMusic(item: youtube_v3.Schema$Video | youtube_v3.Schema$SearchResult): Music {
        const music = new Music();

        const musicId = new ID();
        if (typeof item.id === 'string') {
            musicId.id = item.id;
        } else {
            musicId.id = item.id.videoId;
        }
        musicId.module = MODULE_NAME;
        music.id = musicId;

        music.name = item.snippet.title;

        const artist = new Artist();
        artist.id = new ID();
        artist.id.id = item.snippet.channelId;
        artist.id.module = MODULE_NAME;
        artist.name = item.snippet.channelTitle;
        music.artist = [artist];

        if (item.snippet.thumbnails.hasOwnProperty('maxres')) {
            music.image = item.snippet.thumbnails.maxres.url;
        } else if (item.snippet.thumbnails.hasOwnProperty('high')) {
            music.image = item.snippet.thumbnails.high.url;
        } else if (item.snippet.thumbnails.hasOwnProperty('medium')) {
            music.image = item.snippet.thumbnails.medium.url;
        } else {
            music.image = item.snippet.thumbnails.default.url;
        }

        return music;
    }
    async searchMusic(moduleName: string, keyword: string): Promise<MusicsResult> {
        try {
            const searchResult = (
                await this.youtube.search.list({
                    type: 'video',
                    safeSearch: 'none',
                    q: keyword,
                    part: 'id,snippet'
                })
            ).data;
            const items = searchResult.items;
            const musics: Music[] = items.map(x => this.videoToMusic(x));

            return {
                success: true,
                status: MusicsResultStatus.OK,
                data: musics
            };
        } catch (e) {
            return {
                success: false,
                status: MusicsResultStatus.UNKNOWN_ERROR
            };
        }
    }

    private isVideoExist = {
        api: async (id: ID): Promise<boolean> => {
            const searchResult = (
                await this.youtube.videos.list({
                    id: id.id,
                    part: 'id'
                })
            ).data;
            const items = searchResult.items;
            return items.length > 0;
        },
        youtubedl: async (id: ID): Promise<boolean> => {
            try {
                await getURL(id.id);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    async getMusic(id: ID): Promise<MusicResult> {
        try {
            const searchResult = (
                await this.youtube.videos.list({
                    id: id.id,
                    part: 'snippet'
                })
            ).data;

            const items = searchResult.items;
            if (items.length === 0) throw new Error(MusicResultStatus.MUSIC_NOT_AVAILABLE);
            const item = items[0];
            const music = this.videoToMusic(item);

            return {
                success: true,
                status: MusicResultStatus.OK,
                music
            };
        } catch (e) {
            switch (e.message) {
                case MusicResultStatus.MUSIC_NOT_AVAILABLE:
                    return {
                        success: false,
                        status: MusicResultStatus.MUSIC_NOT_AVAILABLE
                    };
                    break;
                default:
                    return {
                        success: false,
                        status: MusicResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }

    async isMusicAvailable(id: ID) {
        try {
            return await this.isVideoExist.api(id);
        } catch (e) {
            return await this.isVideoExist.youtubedl(id);
        }
    }

    async getMusicURL(id: ID, _: Quality): Promise<URLResult> {
        try {
            const url = await getURL(id.id);
            return {
                success: true,
                url,
                status: MusicResultStatus.OK
            };
        } catch (e) {
            if (e.hasOwnProperty('exitCode')) {
                if (e.exitCode === 1) {
                    return {
                        success: false,
                        status: MusicResultStatus.MUSIC_NOT_AVAILABLE
                    };
                }
            }
            return {
                success: false,
                status: MusicResultStatus.UNKNOWN_ERROR
            };
        }
    }
}
