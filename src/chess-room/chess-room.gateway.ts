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
  cors: '*',
})
export class ChessRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('ChessRoomGateway');

  constructor(private readonly chessRoomService: ChessRoomService) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected:    ${client.id}`);
  }

  // @SubscribeMessage('findAllMoves')
  // findAllMoves() {
  //   return this.chessRoomService.findAllMoves();
  // }

  @SubscribeMessage('createMessage')
  async createMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.chessRoomService.createMessage(createMessageDto);

    this.logger.log(`WS MESSEGE ${createMessageDto}`);
    this.server.emit('message', message);

    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAllMessages() {
    return this.chessRoomService.findAllMessages();
  }

  @SubscribeMessage('joinRoom')
  join(@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    return this.chessRoomService.identify(name, client.id);
  }
}
