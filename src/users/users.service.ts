import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UpdateUser, InsertUser } from './user.entity';
export { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
        this.isRepoEmpty().then(x => {
            if (x) this.createDefaultUser();
        });
    }

    private async isRepoEmpty(): Promise<boolean> {
        const count = await this.userRepository.count();
        return count === 0;
    }

    private async createDefaultUser() {
        const user = new User();
        user.username = 'mushmallow';
        user.password = 'bb1069';
        this.create(user);
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({
            select: ['id', 'username', 'password'],
            where: {
                username
            }
        });
    }

    async update(username: User['username'], user: UpdateUser): Promise<boolean> {
        const result = await this.userRepository.update({ username }, user);
        return result.raw.affectedRows === 1;
    }

    async create(user: InsertUser): Promise<User['id'] | undefined> {
        const result = await this.userRepository.insert(user);
        if (result.identifiers.length) {
            return result.identifiers[0].id;
        } else {
            return;
        }
    }

    async delete(username: User['username']) {
        const result = await this.userRepository.delete({ username });
        return result.affected === 1;
    }
}
