import { Controller, Get, Query, Res, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

import { ID, Quality } from './music.type';
import { MusicResult, URLResult, MusicsResult } from 'src/music/modules.type';
import { MusicService } from './music.service';

import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller('music')
export class MusicController {
    constructor(private readonly musicService: MusicService) {}

    @Get('info')
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'module', type: String })
    @ApiQuery({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        description: 'Found.',
        type: MusicResult
    })
    @ApiNotFoundResponse({
        description: 'Not found.',
        type: MusicResult
    })
    async getMusicInfo(@Query() query) {
        const id: ID = {
            module: query.module,
            id: query.id
        };

        const music = await this.musicService.getMusic(id);
        return music;
    }

    @Get('url')
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'quality', enum: Quality })
    @ApiQuery({ name: 'id', type: String })
    @ApiQuery({ name: 'module', type: String })
    @ApiResponse({ status: 301, description: 'URL Found.' })
    @ApiNotFoundResponse({ description: 'Not Found.', type: URLResult })
    async getMusicURL(@Query() query, @Res() res: Response) {
        const id: ID = {
            module: query.module,
            id: query.id
        };

        const quality: Quality = query.quality;

        const url = await this.musicService.getMusicURL(id, quality);

        if (url.success) {
            res.redirect(url.url);
        } else {
            res.status(HttpStatus.NOT_FOUND);
            res.json(url);
        }
    }

    @Get('search')
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'keyword', type: String })
    @ApiQuery({ name: 'module', type: String })
    @ApiResponse({
        status: 200,
        description: 'Found.',
        type: MusicsResult
    })
    async searchMusic(@Query() query) {
        const module: string = query.module;
        const keyword: string = query.keyword;
        const result = await this.musicService.searchMusic(module, keyword);
        return result;
    }

    @Get('proxy')
    @UseGuards(AuthGuard('jwt'))
    async proxy(@Query() query, @Request() req, @Res() res: Response) {
        return await this.musicService.proxy(query.module, query, req.headers, res);
    }
}
