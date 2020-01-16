import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { User, PublicUser } from '../users/user.entity';
export { PublicUser } from '../users/user.entity';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(
        username: User['username'],
        inPassword: User['password']
    ): Promise<PublicUser | null> {
        const user = await this.usersService.findOne(username);
        if (user && user.password === inPassword) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async changeUserPassword(
        username: User['username'],
        oldPassword: User['password'],
        newPassword: User['password']
    ): Promise<boolean> {
        if (await this.validateUser(username, oldPassword)) {
            const result = await this.usersService.update(username, { password: newPassword });
            return result === 1;
        } else {
            return false;
        }
    }

    async login(user: PublicUser) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
