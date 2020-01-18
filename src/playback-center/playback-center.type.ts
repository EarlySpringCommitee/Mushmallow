import { WsResponse } from '@nestjs/websockets';

export enum PlaybackCenterEvents {
    CLIENT_JOINED = 'clientJoined',
    CLIENTS = 'clients',
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
