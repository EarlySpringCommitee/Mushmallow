import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ID } from './playlist.type';

@Entity()
export class FavoritePlaylist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: String
    })
    creator: User['id'];

    @Column({
        type: 'datetime',
        default: () => 'NOW()'
    })
    createTime: Date;

    @Column()
    module: string;

    @Column({
        type: String
    })
    playlistId: ID['id'];
}

export class InsertFavoritePlaylist {
    creator: User['id'];
    module: string;
    playlistId: ID['id'];
}
