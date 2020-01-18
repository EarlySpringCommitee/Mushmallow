import { Module } from '@nestjs/common';
import { PlaybackCenterService } from './playback-center.service';
import { AuthModule } from '../auth/auth.module';
@Module({
    imports: [AuthModule],
    providers: [PlaybackCenterService]
})
export class PlaybackCenterModule {}
