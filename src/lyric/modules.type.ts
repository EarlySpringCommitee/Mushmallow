import { ID } from '../music/music.type';
export { ID } from '../music/music.type';
import { Lyric } from './lyric.type';

import { ApiProperty } from '@nestjs/swagger';

export interface ILyricService {
    getLyric: (id: ID) => Promise<LyricResult>;
}

export class LyricResult {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    lyric?: Lyric;

    @ApiProperty()
    status?: string;
}

export enum LyricResultStatus {
    OK = 'OK',
    MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
    LYRIC_NOT_AVAILABLE = 'LYRIC_NOT_AVAILABLE'
}
