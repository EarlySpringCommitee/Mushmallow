import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Query, UseGuards, Patch, Body, Delete } from '@nestjs/common';
import { ApiResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

import { PlaylistService } from './playlist.service';
import { PlaylistResult } from './modules.type';
import { ID } from './playlist.type';

@Controller('playlist')
export class PlaylistController {
    constructor(private readonly playlistService: PlaylistService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'module', type: String })
    @ApiQuery({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        description: 'Found.',
        type: PlaylistResult
    })
    @ApiNotFoundResponse({
        description: 'Not found.',
        type: PlaylistResult
    })
    async getPlaylist(@Query() query) {
        const id: ID = {
            module: query.module,
            id: query.id
        };

        const playlist = await this.playlistService.getPlaylist(id);
        return playlist;
    }

    @Patch()
    @UseGuards(AuthGuard('jwt'))
    async save(@Body() body) {
        const song: ID = body.song;
        const playlist: ID = body.playlist;

        const result = await this.playlistService.save(song, playlist);
        return result;
    }

    @Delete()
    @UseGuards(AuthGuard('jwt'))
    async delete(@Body() body) {
        const song: ID = body.song;
        const playlist: ID = body.playlist;

        const result = await this.playlistService.delete(song, playlist);
        return result;
    }
}
