import { AuthGuard } from '@nestjs/passport';
import {
    Controller,
    Get,
    Query,
    UseGuards,
    Patch,
    Body,
    Delete,
    Post,
    Request
} from '@nestjs/common';
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

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createPlaylist(@Body() body, @Request() req) {
        const data = body;
        data.creator = req.user.id;
        const playlist = await this.playlistService.createPlaylist(body);
        return playlist;
    }

    @Delete()
    @UseGuards(AuthGuard('jwt'))
    async deletePlaylist(@Body() body) {
        const id: ID = {
            id: body.id,
            module: body.module
        };
        const playlist = await this.playlistService.deletePlaylist(id);
        return playlist;
    }

    @Patch('record')
    @UseGuards(AuthGuard('jwt'))
    async save(@Body() body) {
        const song: ID = body.song;
        const playlist: ID = body.playlist;

        const result = await this.playlistService.save(song, playlist);
        return result;
    }

    @Delete('record')
    @UseGuards(AuthGuard('jwt'))
    async delete(@Body() body) {
        const song: ID = body.song;
        const playlist: ID = body.playlist;

        const result = await this.playlistService.delete(song, playlist);
        return result;
    }
}
