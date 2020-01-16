import { Injectable } from '@nestjs/common';
import { ILyricService, ID, LyricResult, LyricResultStatus } from './modules.type';

/* Service */
import { NeteaseService } from './netease/netease.service';
type Provider = NeteaseService;
interface ModuleList {
    [moduleName: string]: Provider;
}

function initNetease() {
    if (process.env.NETEASE_ENABLED === '1') {
        const baseURL = process.env.NETEASE_BASEURL;
        this.modules.netease = new NeteaseService(baseURL);
    }
}

@Injectable()
export class LyricService implements ILyricService {
    public modules: ModuleList = {};

    constructor() {
        /* Init Services */
        initNetease.bind(this)();
    }

    async getLyric(id: ID) {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: LyricResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        return await module.getLyric(id);
    }
}
