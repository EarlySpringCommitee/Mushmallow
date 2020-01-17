import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    LocalPlaylist,
    LocalPlaylistData,
    InsertLocalPlaylistData,
    InsertLocalPlaylist
} from './local.entity';
import {
    ID,
    IPlaylistService,
    PlaylistSaveResult,
    PlaylistSaveResultStatus,
    PlaylistResult,
    PlaylistResultStatus,
    PlaylistCreateResultStatus,
    PlaylistCreateResult,
    PlaylistDeleteResult,
    PlaylistDeleteResultStatus
} from '../modules.type';

const MODULE_NAME = 'local';

@Injectable()
export class LocalService implements IPlaylistService {
    constructor(
        @InjectRepository(LocalPlaylist)
        private readonly localPlaylistRepository: Repository<LocalPlaylist>,

        @InjectRepository(LocalPlaylistData)
        private readonly localPlaylistDataRepository: Repository<LocalPlaylistData>
    ) {}

    private playlist = {
        find: async (creator?: LocalPlaylist['creator']): Promise<LocalPlaylist[]> => {
            return creator
                ? await this.localPlaylistRepository.find({ creator })
                : await this.localPlaylistRepository.find({});
        },

        get: async (id: ID['id']): Promise<LocalPlaylist> => {
            return await this.localPlaylistRepository.findOne({ id });
        },

        exist: async (id: ID['id']): Promise<boolean> => {
            return (await this.localPlaylistRepository.count({ id })) > 0;
        },

        isInPlaylist: async (
            song: ID,
            playlist: ID
        ): Promise<LocalPlaylistData['id'] | undefined> => {
            const result = await this.localPlaylistDataRepository.findOne({
                playlistId: playlist.id,
                musicModule: song.module,
                musicId: song.id
            });
            if (result) {
                return result.id;
            }
            return;
        },

        create: async (playlist: InsertLocalPlaylist): Promise<LocalPlaylist['id'] | undefined> => {
            const result = await this.localPlaylistRepository.insert(playlist);
            if (result.identifiers.length) {
                return result.identifiers[0].id;
            } else {
                return;
            }
        },

        delete: async (id: LocalPlaylist['id']) => {
            const result = await this.localPlaylistRepository.delete({ id });
            await this.playlistData.deleteAll(id);
            return result.affected === 1;
        }
    };

    private playlistData = {
        find: async (playlistId: LocalPlaylistData['playlistId']): Promise<LocalPlaylistData[]> => {
            const result = await this.localPlaylistDataRepository.find({ playlistId });
            return result;
        },

        create: async (
            data: InsertLocalPlaylistData
        ): Promise<LocalPlaylistData['id'] | undefined> => {
            const recordId = await this.playlist.isInPlaylist(
                { id: data.musicId, module: data.musicModule },
                { id: data.playlistId, module: MODULE_NAME }
            );
            if (recordId !== undefined) {
                return recordId;
            } else {
                const result = await this.localPlaylistDataRepository.insert(data);
                if (result.identifiers.length) {
                    return result.identifiers[0].id;
                } else {
                    return;
                }
            }
        },

        delete: async (id: LocalPlaylistData['id']) => {
            const result = await this.localPlaylistDataRepository.delete({ id });
            return result.affected === 1;
        },

        deleteAll: async (playlistId: LocalPlaylist['id']) => {
            const result = await this.localPlaylistDataRepository.delete({ playlistId });
            return result.affected > 0;
        }
    };

    async save(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        try {
            if (!(await this.playlist.exist(playlist.id))) {
                throw new Error(PlaylistSaveResultStatus.PLAYLIST_NOT_FOUND);
            }
            const data = new InsertLocalPlaylistData();
            data.playlistId = playlist.id;
            data.musicId = song.id;
            data.musicModule = song.module;

            const result = await this.playlistData.create(data);
            if (result) {
                return {
                    success: true,
                    status: PlaylistSaveResultStatus.OK
                };
            } else {
                throw new Error();
            }
        } catch (e) {
            switch (e.message) {
                case PlaylistResultStatus.PLAYLIST_NOT_FOUND:
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.PLAYLIST_NOT_FOUND
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

    async delete(song: ID, playlist: ID): Promise<PlaylistSaveResult> {
        try {
            if (!(await this.playlist.exist(playlist.id))) {
                throw new Error(PlaylistSaveResultStatus.PLAYLIST_NOT_FOUND);
            }
            const data = new InsertLocalPlaylistData();
            data.playlistId = playlist.id;
            data.musicId = song.id;
            data.musicModule = song.module;

            const recordId = await this.playlist.isInPlaylist(song, playlist);

            if (recordId === undefined) {
                return {
                    success: true,
                    status: PlaylistSaveResultStatus.OK
                };
            } else {
                const result = await this.playlistData.delete(recordId);
                if (result) {
                    return {
                        success: true,
                        status: PlaylistSaveResultStatus.OK
                    };
                } else {
                    throw new Error();
                }
            }
        } catch (e) {
            switch (e.message) {
                case PlaylistResultStatus.PLAYLIST_NOT_FOUND:
                    return {
                        success: false,
                        status: PlaylistSaveResultStatus.PLAYLIST_NOT_FOUND
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

    async getPlaylist(id: ID): Promise<PlaylistResult> {
        try {
            if (!(await this.playlist.exist(id.id))) {
                throw new Error(PlaylistResultStatus.PLAYLIST_NOT_FOUND);
            }
            const localPlaylist = await this.playlist.get(id.id);
            const localPlaylistDatas = await this.playlistData.find(id.id);
            const data = localPlaylistDatas.map(
                (x: LocalPlaylistData): ID => {
                    return {
                        id: x.musicId,
                        module: x.musicModule
                    };
                }
            );
            const playlist = {
                name: localPlaylist.name,
                module: MODULE_NAME,
                data
            };
            return {
                success: true,
                playlist,
                status: PlaylistResultStatus.OK
            };
        } catch (e) {
            switch (e.message) {
                case PlaylistResultStatus.PLAYLIST_NOT_FOUND:
                    return {
                        success: false,
                        status: PlaylistResultStatus.PLAYLIST_NOT_FOUND
                    };
                    break;
                default:
                    return {
                        success: false,
                        status: PlaylistResultStatus.UNKNOWN_ERROR
                    };
            }
        }
    }

    async createPlaylist(playlist: InsertLocalPlaylist): Promise<PlaylistCreateResult> {
        const playlistId = await this.playlist.create(playlist);
        if (playlistId) {
            return {
                success: true,
                status: PlaylistCreateResultStatus.OK,
                id: playlistId
            };
        } else {
            return {
                success: false,
                status: PlaylistCreateResultStatus.UNKNOWN_ERROR
            };
        }
    }

    async deletePlaylist(id: ID): Promise<PlaylistDeleteResult> {
        const exist = await this.playlist.exist(id.id);
        if (!exist) {
            return {
                success: false,
                status: PlaylistDeleteResultStatus.PLAYLIST_NOT_FOUND
            };
        } else {
            const result = await this.playlist.delete(id.id);
            if (result) {
                return {
                    success: true,
                    status: PlaylistDeleteResultStatus.OK
                };
            } else {
                return {
                    success: false,
                    status: PlaylistDeleteResultStatus.UNKNOWN_ERROR
                };
            }
        }
    }
}
