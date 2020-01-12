import { Injectable } from '@nestjs/common';

import { MusicResult, MusicResultStatus, IMusicService, URLResult } from './modules.type';
import { ID, Quality } from './music.type';

/* Service */
import { NeteaseService } from './netease/netease.service';
type Provider = NeteaseService;
interface ModuleList {
    [moduleName: string]: Provider;
}

@Injectable()
export class ModulesService implements IMusicService {
    public modules: ModuleList = {};

    constructor() {
        /* Init Services */
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
}
