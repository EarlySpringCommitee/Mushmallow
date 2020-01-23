import { ID } from '../music/music.type';
export { ID } from '../music/music.type';

export class Playlist {
    name: string;
    module: string;
    data: ID[];
    image?: string;
    description?: string;
}
