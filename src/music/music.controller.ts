import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

import { ID, Quality } from './music.type';
import { MusicResult, URLResult } from 'src/music/modules.type';
import { ModulesService } from './modules.service';

import { Response } from 'express';

@Controller('music')
export class MusicController {
    constructor(private readonly modulesService: ModulesService) {}

    @Get('info')
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

        const music = await this.modulesService.getMusic(id);
        return music;
    }

    @Get('url')
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

        const url = await this.modulesService.getMusicURL(id, quality);

        if (url.success) {
            res.redirect(url.url);
        } else {
            res.status(HttpStatus.NOT_FOUND);
            res.json(url);
        }
    }
}
