import { Controller, Get, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { LyricService } from './lyric.service';
import { LyricResult, ID } from './modules.type';

@Controller('lyric')
export class LyricController {
    constructor(private readonly lyricService: LyricService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'module', type: String })
    @ApiQuery({ name: 'id', type: String })
    @ApiResponse({
        status: 200,
        description: 'Found.',
        type: LyricResult
    })
    @ApiNotFoundResponse({
        description: 'Not found.',
        type: LyricResult
    })
    async getLyric(@Query() query) {
        const id: ID = {
            module: query.module,
            id: query.id
        };

        const lyric = await this.lyricService.getLyric(id);
        return lyric;
    }
}
