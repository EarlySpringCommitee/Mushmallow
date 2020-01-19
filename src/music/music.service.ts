import { Injectable } from '@nestjs/common';

import {
    MusicResult,
    MusicResultStatus,
    IMusicService,
    URLResult,
    MusicsResult,
    MusicsResultStatus
} from './modules.type';
import { ID, Quality } from './music.type';

/* Service */
import { NeteaseService } from './netease/netease.service';
import { YoutubeService } from './youtube/youtube.service';
type Provider = NeteaseService;
interface ModuleList {
    [moduleName: string]: Provider;
}

function initNetease() {
    if (process.env.NETEASE_ENABLED === '1') {
        const baseURL = process.env.NETEASE_BASEURL;
        this.modules.netease = new NeteaseService(baseURL);

        if (process.env.NETEASE_PHONE) {
            this.modules.netease.login({
                phone: process.env.NETEASE_PHONE,
                password: process.env.NETEASE_PASSWORD
            });
        } else if (process.env.NETEASE_EMAIL) {
            this.modules.netease.login({
                email: process.env.NETEASE_EMAIL,
                password: process.env.NETEASE_PASSWORD
            });
        }
    }
}

function initYoutube() {
    if (process.env.YOUTUBE_ENABLED === '1') {
        this.modules.youtube = new YoutubeService(process.env.YOUTUBE_API_KEY);
    }
}

@Injectable()
export class MusicService implements IMusicService {
    public modules: ModuleList = {};

    constructor() {
        /* Init Services */
        initNetease.bind(this)();
        initYoutube.bind(this)();
    }

    async isMusicAvailable(id: ID): Promise<boolean> {
        const module = this.modules[id.module];
        return await module.isMusicAvailable(id);
    }

    async getMusic(id: ID): Promise<MusicResult> {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: MusicResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        if (!module.isMusicAvailable(id)) {
            return {
                success: false,
                status: MusicResultStatus.MUSIC_NOT_AVAILABLE
            };
        }
        return await module.getMusic(id);
    }

    async getMusicURL(id: ID, quality: Quality): Promise<URLResult> {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: MusicResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        if (!module.isMusicAvailable(id)) {
            return {
                success: false,
                status: MusicResultStatus.MUSIC_NOT_AVAILABLE
            };
        }

        return await module.getMusicURL(id, quality);
    }

    async searchMusic(moduleName: string, keyword: string): Promise<MusicsResult> {
        if (!this.modules.hasOwnProperty(moduleName)) {
            return {
                success: false,
                status: MusicsResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[moduleName];
        return await module.searchMusic(moduleName, keyword);
    }
}
