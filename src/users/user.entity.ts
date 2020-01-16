import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

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
