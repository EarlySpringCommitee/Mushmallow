import { Injectable, UseGuards, Request } from '@nestjs/common';
import {
    WebSocketGateway,
    SubscribeMessage,
    WsResponse,
    WebSocketServer,
    WsException,
    ConnectedSocket,
    MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

import {
    PlaybackCenterEvents,
    RoomCreatedBroadcastBody,
    RoomCreatedSingleBody,
    ClientsSingleBody,
    ClientsResult,
    RoomCreatedResult
} from './playback-center.type';

@Injectable()
@WebSocketGateway()
export class PlaybackCenterService {
    constructor(private readonly authService: AuthService) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        try {
            const result = await this.authService.verifyJwt(client.handshake.query.token);
            client.handshake.headers.user = {
                id: result.sub,
                username: result.username
            };
        } catch (e) {
            throw new WsException('Unauthorized');
        }
    }

    @SubscribeMessage(PlaybackCenterEvents.CHECKIN)
    checkin(@MessageBody() name: string, @ConnectedSocket() client: Socket): RoomCreatedResult {
        const room = client.handshake.headers.user.id;

        client.join(room);

        const roomCreatedBroadcastBody: RoomCreatedBroadcastBody = {
            room,
            name
        };
        client.to(room).emit(PlaybackCenterEvents.CLIENT_JOINED, roomCreatedBroadcastBody);

        const respBody = new RoomCreatedSingleBody();
        respBody.room = room;
        respBody.id = client.id;
        respBody.name = name;

        const response = new RoomCreatedResult();
        response.data = respBody;

        return response;
    }

    @SubscribeMessage(PlaybackCenterEvents.CLIENTS)
    handleEvent(@MessageBody() body: string, @ConnectedSocket() client: Socket): ClientsResult {
        const roomId = client.handshake.headers.user.id;

        const room = client.adapter.rooms[roomId];

        const respBody = new ClientsSingleBody();
        respBody.clients = Object.keys(room.sockets);

        const response = new ClientsResult();
        response.data = respBody;

        return response;
    }
}
