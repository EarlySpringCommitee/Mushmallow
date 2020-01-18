import { WsResponse } from '@nestjs/websockets';
import { Music } from 'src/music/music.type';

export enum PlaybackCenterEvents {
    CLIENT_JOINED = 'clientJoined',
    CLIENTS = 'clients',
    REQUEST_CLIENT = 'requestClient',
    RESPONSE_CLIENT = 'responseClient',
    CHECKIN = 'checkin'
}

export enum ClientStatus {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    PAUSE = 'PAUSE'
}

export class RoomCreatedBroadcastBody {
    room: string;
    name: string;
}

export class RoomCreatedSingleBody {
    room: string;
    name: string;
    id: string;
}

export class RoomCreatedResult implements WsResponse<RoomCreatedSingleBody> {
    constructor() {
        this.event = PlaybackCenterEvents.CHECKIN;
    }

    event: PlaybackCenterEvents;
    data: RoomCreatedSingleBody;
}

export class ClientsSingleBody {
    clients: string[];
}

export class ClientsResult implements WsResponse<ClientsSingleBody> {
    constructor() {
        this.event = PlaybackCenterEvents.CLIENTS;
    }
    event: PlaybackCenterEvents;
    data: ClientsSingleBody;
}

export class Client {
    id: string;
    name?: string;
    playlist?: Music[];
    status?: ClientStatus;
}

export class ClientResultBody extends Client {
    success: boolean;
}

export class ClientResult {
    constructor() {
        this.event = PlaybackCenterEvents.REQUEST_CLIENT;
    }
    event: PlaybackCenterEvents;
    data: ClientResultBody;
}

export class ResponseClientBody extends Client {
    requestor: string;
}

export class ClientNotFoundError extends Error {
    constructor() {
        super('Client not found');
        this.name = this.constructor.name;
    }
}
