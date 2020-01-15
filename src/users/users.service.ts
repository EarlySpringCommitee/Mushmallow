import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
export { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async findOne(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({
            select: ['id', 'username', 'password'],
            where: {
                username
            }
        });
    }
}
