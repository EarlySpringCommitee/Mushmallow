import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface PublicUser {
    id: string;
    username: string;
}

@Entity()
export class User implements PublicUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true
    })
    username: string;

    @Column()
    password: string;
}

export interface UpdateUser {
    username?: string;
    password?: string;
}

export interface InsertUser {
    username: string;
    password: string;
}
