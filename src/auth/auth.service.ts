import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { User, PublicUser, InsertUser } from '../users/user.entity';
export { PublicUser } from '../users/user.entity';
import { CreateUserResultStatus, CreateUserResult, UpdateUserResult } from './auth.type';

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
    ): Promise<UpdateUserResult> {
        if (await this.validateUser(username, oldPassword)) {
            const result = await this.usersService.update(username, { password: newPassword });
            return { success: result };
        } else {
            return { success: false };
        }
    }

    async login(user: PublicUser) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    async createUser(user: InsertUser): Promise<CreateUserResult> {
        const usernameExist: boolean = Boolean(await this.usersService.findOne(user.username));
        if (usernameExist) {
            return {
                success: false,
                status: CreateUserResultStatus.USERNAME_EXIST
            };
        }
        const result = await this.usersService.create(user);
        if (result) {
            return {
                success: true,
                status: CreateUserResultStatus.OK,
                id: result
            };
        } else {
            return {
                success: false,
                status: CreateUserResultStatus.UNKNOWN_ERROR
            };
        }
    }

    async isUsernameExist(username: User['username']): Promise<boolean> {
        return Boolean(await this.usersService.findOne(username));
    }
}
