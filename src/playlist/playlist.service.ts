import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    PlaylistResult,
    PlaylistResultStatus,
    IPlaylistService,
    PlaylistSaveResult,
    PlaylistSaveResultStatus,
    PlaylistCreateResultStatus,
    PlaylistCreateResult,
    PlaylistDeleteResult,
    PlaylistDeleteResultStatus,
    FavoritePlaylistSaveResult,
    FavoritePlaylistSaveResultStatus,
    FavoritePlaylistDeleteResult,
    FavoritePlaylistDeleteResultStatus,
    FavoritePlaylistResult,
    FavoritePlaylistResultStatus
} from './modules.type';
import { ID } from './playlist.type';
import { FavoritePlaylist, InsertFavoritePlaylist } from './playlist.entity';

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

    constructor(
        private readonly localService: LocalService,

        @InjectRepository(FavoritePlaylist)
        private readonly favoritePlaylistRepository: Repository<FavoritePlaylist>
    ) {
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

    async getAlbum(id: ID): Promise<PlaylistResult> {
        if (!this.modules.hasOwnProperty(id.module)) {
            return {
                success: false,
                status: PlaylistResultStatus.MODULE_NOT_FOUND
            };
        }

        const module = this.modules[id.module];
        if (typeof module['getAlbum'] !== 'function') {
            return {
                success: false,
                status: PlaylistResultStatus.MODULE_NOT_SUPPORTED
            };
        }
        const result = await module.getAlbum(id);
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
        if (typeof module['save'] !== 'function') {
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
        if (typeof module['delete'] !== 'function') {
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
        if (typeof module['createPlaylist'] !== 'function') {
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
        if (typeof module['deletePlaylist'] !== 'function') {
            return {
                success: false,
                status: PlaylistDeleteResultStatus.MODULE_NOT_SUPPORTED
            };
        }

        const result = await module.deletePlaylist(id);
        return result;
    }

    async getFavoritePlaylist(creator: ID['id']): Promise<FavoritePlaylistResult> {
        try {
            const result = await this.favoritePlaylistRepository.find({ creator });
            if (result) {
                return {
                    success: true,
                    status: FavoritePlaylistResultStatus.OK,
                    data: result.map(x => ({
                        module: x.module,
                        id: x.playlistId
                    }))
                };
            } else {
                throw new Error(FavoritePlaylistResultStatus.UNKNOWN_ERROR);
            }
        } catch (e) {
            switch (e.message) {
                case FavoritePlaylistSaveResultStatus.UNKNOWN_ERROR:
                default:
                    return {
                        success: false,
                        status: FavoritePlaylistResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }

    async addFavoritePlaylist(creator: ID['id'], id: ID): Promise<FavoritePlaylistSaveResult> {
        try {
            if (!this.modules.hasOwnProperty(id.module)) {
                throw new Error(FavoritePlaylistSaveResultStatus.MODULE_NOT_FOUND);
            }

            const favoritePlaylist = new InsertFavoritePlaylist();
            favoritePlaylist.module = id.module;
            favoritePlaylist.playlistId = id.id;
            favoritePlaylist.creator = creator;

            const result = await this.favoritePlaylistRepository.insert(favoritePlaylist);
            if (result.identifiers.length) {
                return {
                    success: true,
                    status: FavoritePlaylistSaveResultStatus.OK,
                    id: result.identifiers[0].id
                };
            } else {
                throw new Error(FavoritePlaylistSaveResultStatus.UNKNOWN_ERROR);
            }
        } catch (e) {
            switch (e.message) {
                case FavoritePlaylistSaveResultStatus.MODULE_NOT_FOUND:
                    return {
                        success: false,
                        status: FavoritePlaylistSaveResultStatus.MODULE_NOT_FOUND
                    };
                    break;
                case FavoritePlaylistSaveResultStatus.UNKNOWN_ERROR:
                default:
                    return {
                        success: false,
                        status: FavoritePlaylistSaveResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }

    async deleteFavoritePlaylist(
        creator: ID['id'],
        id: number
    ): Promise<FavoritePlaylistDeleteResult> {
        try {
            const record = await this.favoritePlaylistRepository.findOne({ id });
            if (!record) {
                throw new Error(FavoritePlaylistDeleteResultStatus.PLAYLIST_NOT_FOUND);
            }
            if (record.creator != creator) {
                throw new Error(FavoritePlaylistDeleteResultStatus.UNAUTHORIZED);
            }
            const result = await this.favoritePlaylistRepository.delete({ id });
            switch (result.affected) {
                case 0:
                    throw new Error(FavoritePlaylistDeleteResultStatus.PLAYLIST_NOT_FOUND);
                    break;
                case 1:
                    return {
                        success: true,
                        status: FavoritePlaylistDeleteResultStatus.OK
                    };
                default:
                    throw new Error(FavoritePlaylistDeleteResultStatus.UNKNOWN_ERROR);
            }
        } catch (e) {
            switch (e.message) {
                case FavoritePlaylistDeleteResultStatus.PLAYLIST_NOT_FOUND:
                    return {
                        success: false,
                        status: FavoritePlaylistDeleteResultStatus.PLAYLIST_NOT_FOUND
                    };
                case FavoritePlaylistDeleteResultStatus.UNAUTHORIZED:
                    return {
                        success: false,
                        status: FavoritePlaylistDeleteResultStatus.UNAUTHORIZED
                    };
                case FavoritePlaylistSaveResultStatus.UNKNOWN_ERROR:
                default:
                    return {
                        success: false,
                        status: FavoritePlaylistDeleteResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }
}
