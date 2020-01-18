import { ApiProperty } from '@nestjs/swagger';

export class ID {
    @ApiProperty()
    module: string;

    @ApiProperty()
    id: string;
}

export class Artist {
    @ApiProperty()
    id: ID;

    @ApiProperty()
    name: string;

    @ApiProperty()
    image?: string;
}

export class Album {
    @ApiProperty()
    id: ID;

    @ApiProperty()
    name: string;

    @ApiProperty()
    image?: string;
}

export class Music {
    @ApiProperty()
    id: ID;

    @ApiProperty()
    name: string;

    @ApiProperty()
    artist?: Artist[];

    @ApiProperty()
    album?: Album;
}

export enum Quality {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH',
    ORIGINAL = 'ORIGINAL'
}
