import { Injectable, UseGuards, Request } from '@nestjs/common';
import {
    WebSocketGateway,
    SubscribeMessage,
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
    RoomCreatedResult,
    Client,
    ClientResult,
    ClientResultBody,
    ClientNotFoundError,
    ResponseClientBody,
    RequestActionBody,
    ResponseActionBody,
    ResponseActionBodyStatus
} from './playback-center.type';

@Injectable()
@WebSocketGateway()
export class PlaybackCenterService {
    constructor(private readonly authService: AuthService) {}

    private getClient(client: Socket, id: string): Socket {
        const clients = client.server.clients().connected;
        if (!(id in clients)) {
            throw new ClientNotFoundError();
        }
        return clients[id];
    }

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
    clients(@ConnectedSocket() client: Socket): ClientsResult {
        const roomId = client.handshake.headers.user.id;

        const room = client.adapter.rooms[roomId];

        const respBody = new ClientsSingleBody();
        respBody.clients = Object.keys(room.sockets);

        const response = new ClientsResult();
        response.data = respBody;

        return response;
    }

    @SubscribeMessage(PlaybackCenterEvents.REQUEST_CLIENT)
    requestClient(@MessageBody() targetId: string, @ConnectedSocket() client: Socket) {
        try {
            const target = this.getClient(client, targetId);
            target.emit(PlaybackCenterEvents.REQUEST_CLIENT, targetId);
        } catch (e) {
            if (e instanceof ClientNotFoundError) {
                const result = new ClientResultBody();
                result.success = false;
                result.id = targetId;

                client.emit(PlaybackCenterEvents.RESPONSE_CLIENT, result);
            } else {
                throw e;
            }
        }
    }

    @SubscribeMessage(PlaybackCenterEvents.RESPONSE_CLIENT)
    responseClient(@MessageBody() body: ResponseClientBody, @ConnectedSocket() client: Socket) {
        try {
            const targetId = body.requestor;
            const target = this.getClient(client, targetId);
            target.emit(PlaybackCenterEvents.RESPONSE_CLIENT, body);
        } catch (e) {
            if (e instanceof ClientNotFoundError) {
            } else {
                throw e;
            }
        }
    }

    @SubscribeMessage(PlaybackCenterEvents.REQUEST_ACTION)
    requestAction(@MessageBody() body: RequestActionBody, @ConnectedSocket() client: Socket) {
        try {
            const targetId = body.target;
            const target = this.getClient(client, targetId);
            target.emit(PlaybackCenterEvents.REQUEST_ACTION, body);
        } catch (e) {
            if (e instanceof ClientNotFoundError) {
                const result = new ResponseActionBody();
                result.success = false;
                result.status = ResponseActionBodyStatus.CLIENT_NOT_FOUND;
                result.id = body.id;
                result.requestor = body.requestor;

                client.emit(PlaybackCenterEvents.RESPONSE_ACTION, result);
            } else {
                throw e;
            }
        }
    }

    @SubscribeMessage(PlaybackCenterEvents.RESPONSE_ACTION)
    resposeAction(@MessageBody() body: ResponseActionBody, @ConnectedSocket() client: Socket) {
        try {
            const targetId = body.requestor;
            const target = this.getClient(client, targetId);
            target.emit(PlaybackCenterEvents.RESPONSE_ACTION, body);
        } catch (e) {
            if (e instanceof ClientNotFoundError) {
            } else {
                throw e;
            }
        }
    }
}
