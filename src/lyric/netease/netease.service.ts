import { Injectable } from '@nestjs/common';
import { Lyric } from '../lyric.type';
import { ILyricService, ID, LyricResult, LyricResultStatus } from '../modules.type';
import { migrate } from '../migrate';

const MODULE_NAME = 'netease';

import * as request from 'request-promise-native';
const rp = request.defaults({
    json: true
});

@Injectable()
export class NeteaseService implements ILyricService {
    baseURL: String;

    constructor(baseURL: String) {
        this.baseURL = baseURL;
    }

    async getLyric(id: ID): Promise<LyricResult> {
        if (id.module === MODULE_NAME) {
            const result = await rp(`${this.baseURL}/lyric?id=${id.id}`);
            if (result.lrc) {
                if (result.tlyric) {
                    return {
                        success: true,
                        lyric: migrate(result.lrc.lyric, result.tlyric.lyric),
                        status: LyricResultStatus.OK
                    };
                } else {
                    return {
                        success: true,
                        lyric: result.lrc.lyric,
                        status: LyricResultStatus.OK
                    };
                }
            } else {
                return {
                    success: false,
                    status: LyricResultStatus.LYRIC_NOT_AVAILABLE
                };
            }
        } else {
            return {
                success: false,
                status: LyricResultStatus.LYRIC_NOT_AVAILABLE
            };
        }
    }
}
