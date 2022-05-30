import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChessRoomService } from './chess-room.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  namespace: 'chess-room',
  cors: '*',
})
export class ChessRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wsServer: Server;

  private logger: Logger = new Logger('ChessRoomGateway');

  constructor(private readonly chessRoomService: ChessRoomService) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    const clientRooms = client.rooms;
    this.logger.log('Client rooms:', ...clientRooms);
    for (const room in clientRooms) {
      client.leave(room);
    }
    client.disconnect();
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected:    ${client.id}`);
  }

  @SubscribeMessage('newMove')
  async createMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.chessRoomService.addFenMove(createMessageDto);

    this.logger.log(`WS MESSEGE ${createMessageDto.message} FROM ${client.id}`);
    this.logger.log(
      `WS MESSEGE TO ROOM ${createMessageDto.roomId} FROM CLIENT WITH`,
    );
    console.log(this.wsServer.to(createMessageDto.roomId).allSockets());
    this.wsServer
      .to(createMessageDto.roomId)
      .except(client.id)
      .emit('opponent move', createMessageDto);

    return message;
  }

  @SubscribeMessage('joinRoom')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
    @MessageBody('userId') userId: string,
  ) {
    if ((await this.wsServer.to(roomId).allSockets()).size < 2) {
      client.join(roomId);
      await this.chessRoomService.joinRoom(roomId, userId);
      client.emit('joined', { mySocketId: client.id });
    }
    if ((await this.wsServer.to(roomId).allSockets()).size === 2) {
      this.wsServer.to(roomId).emit('gameStart');
    }
    console.log((await this.wsServer.to(roomId).allSockets()).size);
  }
}
