import { Injectable } from '@nestjs/common';

import { UsersService, PublicUser } from '../users/users.service';
export { PublicUser } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(username: string, inPassword: string): Promise<PublicUser | null> {
        const user = await this.usersService.findOne(username);
        if (user && user.password === inPassword) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: PublicUser) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
