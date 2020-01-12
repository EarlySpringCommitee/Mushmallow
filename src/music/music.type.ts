export interface ID {
    module: string;
    id: string | number;
}

export interface Artist {
    id: ID;
    name: string;
    image?: string;
}

export interface Album {
    id: ID;
    name: string;
    image?: string;
}

export interface Music {
    id: ID;
    name: string;
    artist?: Artist[];
    album?: Album;
}

export enum Quality {
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH,
    ORIGINAL
}
