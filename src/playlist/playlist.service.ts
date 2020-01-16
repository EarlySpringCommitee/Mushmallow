import { Injectable } from '@nestjs/common';

import {
    PlaylistResult,
    PlaylistResultStatus,
    IPlaylistService,
    PlaylistSaveResult,
    PlaylistSaveResultStatus
} from './modules.type';
import { ID, Playlist } from './playlist.type';

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

@Injectable()
export class PlaylistService implements IPlaylistService {
    public modules: ModuleList = {};

    constructor() {
        /* Init Services */
        initNetease.bind(this)();
    }

    async getPlaylist(id: ID): Promise<PlaylistResult> {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: PlaylistResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        const result = await module.getPlaylist(id);
        return result;
    }

    async save(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        if (!this.modules.hasOwnProperty(playlist.module)) {
            return {
                success: false,
                status: PlaylistSaveResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[playlist.module];
        if (typeof module.save !== 'function') {
            return {
                success: false,
                status: PlaylistSaveResultStatus.PLAYLIST_NOT_SUPPORTED
            };
        }
        const result = await module.save(song, playlist);
        return result;
    }

    async delete(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        if (!this.modules.hasOwnProperty(playlist.module)) {
            return {
                success: false,
                status: PlaylistSaveResultStatus.MODULE_NOT_FOUND
            };
        }
        const module = this.modules[playlist.module];
        if (typeof module.delete !== 'function') {
            return {
                success: false,
                status: PlaylistSaveResultStatus.PLAYLIST_NOT_SUPPORTED
            };
        }
        const result = await module.delete(song, playlist);
        return result;
    }
}
