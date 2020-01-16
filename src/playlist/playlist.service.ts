import { Injectable } from '@nestjs/common';

import {
    PlaylistResult,
    PlaylistResultStatus,
    IPlaylistService,
    PlaylistSaveResult,
    PlaylistSaveResultStatus,
    PlaylistCreateResultStatus,
    PlaylistCreateResult,
    PlaylistDeleteResult,
    PlaylistDeleteResultStatus
} from './modules.type';
import { ID, Playlist } from './playlist.type';

/* Service */
import { NeteaseService } from './netease/netease.service';

import { LocalService } from './local/local.service';

type Provider = IPlaylistService;
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

function initLocal() {
    this.modules.local = this.localService;
}

@Injectable()
export class PlaylistService implements IPlaylistService {
    public modules: ModuleList = {};

    constructor(private readonly localService: LocalService) {
        /* Init Services */
        for (const f of [initNetease, initLocal]) {
            f.bind(this)();
        }
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

    async createPlaylist(playlist: any): Promise<PlaylistCreateResult> {
        if (!this.modules.hasOwnProperty(playlist.module)) {
            return {
                success: false,
                status: PlaylistCreateResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[playlist.module];
        if (typeof module.createPlaylist !== 'function') {
            return {
                success: false,
                status: PlaylistCreateResultStatus.MODULE_NOT_SUPPORTED
            };
        }

        const result = await module.createPlaylist(playlist);
        return result;
    }

    async deletePlaylist(id: ID): Promise<PlaylistDeleteResult> {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: PlaylistDeleteResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        if (typeof module.deletePlaylist !== 'function') {
            return {
                success: false,
                status: PlaylistDeleteResultStatus.MODULE_NOT_SUPPORTED
            };
        }

        const result = await module.deletePlaylist(id);
        return result;
    }
}
