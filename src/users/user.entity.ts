import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface PublicUser {
    id: number;
    username: string;
}

@Entity()
export class User implements PublicUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    username: string;

    @Column()
    password: string;
}
