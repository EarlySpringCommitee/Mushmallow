import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PublicUser } from '../users/user.entity';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromUrlQueryParameter('access_token'),
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SERECT
        });
    }

    async validate(payload: any): Promise<PublicUser> {
        return { id: payload.sub, username: payload.username };
    }
}
