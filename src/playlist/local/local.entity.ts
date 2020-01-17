import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Music } from 'src/music/music.type';

@Entity()
export class LocalPlaylist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
    name: string;
}

@Entity()
export class LocalPlaylistData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: String
    })
    playlistId: LocalPlaylist['id'];

    @Column({
        type: String
    })
    musicModule: Music['id']['module'];

    @Column({
        type: String
    })
    musicId: Music['id']['id'];

    @Column({
        type: 'datetime',
        default: () => 'NOW()'
    })
    createTime: Date;
}

export class InsertLocalPlaylist {
    creator: LocalPlaylist['creator'];

    name: LocalPlaylist['name'];
}

export class InsertLocalPlaylistData {
    playlistId: LocalPlaylist['id'];

    musicModule: Music['id']['module'];

    musicId: Music['id']['id'];
}
