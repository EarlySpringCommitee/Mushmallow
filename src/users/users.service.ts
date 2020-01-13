import { Injectable } from '@nestjs/common';

export interface PublicUser {
    userId: number;
    username: string;
}

export interface User extends PublicUser {
    password: string;
}

@Injectable()
export class UsersService {
    private readonly users: User[];

    constructor() {
        this.users = [
            {
                userId: 1,
                username: 'leko',
                password: 'bb1069'
            },
            {
                userId: 2,
                username: 'bb',
                password: 'abbaba'
            }
        ];
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
}
