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
    const clientRooms = client.rooms.keys();
    this.logger.log('Client rooms:', ...clientRooms);
    this.wsServer.to(clientRooms[0]).emit('opponentWasDisconnected');
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
    const isGameOver = await this.chessRoomService.isGameOver(createMessageDto);

    this.logger.log(`WS MESSEGE ${createMessageDto.message} FROM ${client.id}`);
    this.logger.log(
      `WS MESSEGE TO ROOM ${createMessageDto.roomId} FROM CLIENT WITH`,
    );
    console.log(this.wsServer.to(createMessageDto.roomId).allSockets());
    this.wsServer
      .to(createMessageDto.roomId)
      .except(client.id)
      .emit('opponent move', createMessageDto);

    if (isGameOver !== false) {
      this.wsServer.to(createMessageDto.roomId).emit('gameIsOver', isGameOver);
    }

    return message;
  }

  @SubscribeMessage('joinRoom')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
    @MessageBody('userId') userId: string,
  ) {
    const isGameOver = await this.chessRoomService.gameIsOver(roomId);
    if (isGameOver !== false) {
      client.emit('gameIsOver', isGameOver);
      return;
    }
    if ((await this.wsServer.to(roomId).allSockets()).size < 2) {
      client.join(roomId);
      await this.chessRoomService.joinRoom(roomId, userId);
      client.emit('joined', { mySocketId: client.id });
    }
    console.log(this.wsServer.to(roomId).allSockets());
    if ((await this.wsServer.to(roomId).allSockets()).size === 2) {
      await this.chessRoomService.addGameToUsers(roomId);
      this.wsServer.to(roomId).emit('gameStart');
    }
  }

  @SubscribeMessage('giveUp')
  async giveUp(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
    @MessageBody('userId') userId: string,
  ) {
    try {
      await this.chessRoomService.giveUp(roomId, userId);
    } catch {}
    const isGameOver = await this.chessRoomService.gameIsOver(roomId);
    if (isGameOver !== false) {
      this.wsServer
        .to(roomId)
        .emit('gameIsOver', { ...isGameOver, text: 'Противник сдался' });
      return;
    }
  }
}
