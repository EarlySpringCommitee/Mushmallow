import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';

import { ID } from './music.type';
import { ModulesService } from './modules.service';

import { Response } from 'express';

@Controller('music')
export class MusicController {
    constructor(private readonly modulesService: ModulesService) {}

    @Get('info/:moduleName/:id')
    async getMusicInfo(@Param() params) {
        const id: ID = {
            module: params.moduleName,
            id: params.id
        };

        const music = await this.modulesService.getMusic(id);
        return music;
    }

    @Get('url/:moduleName/:id/:quality')
    async getMusicURL(@Param() params, @Res() res: Response) {
        const id: ID = {
            module: params.moduleName,
            id: params.id
        };

        const quality = parseInt(params.quality);

        const url = await this.modulesService.getMusicURL(id, quality);

        if (url.success) {
            res.redirect(url.url);
        } else {
            res.status(HttpStatus.NOT_FOUND);
            res.json(url);
        }
    }
}
