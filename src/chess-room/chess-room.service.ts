import { Injectable } from '@nestjs/common';
import { CreateChessRoomDto } from './dto/create-chess-room.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class ChessRoomService {
  messages: Message[] = [{ fen: '' }];
  clientToUser = {};

  createMessage(createMessageDto: CreateMessageDto) {
    const message = { ...createMessageDto };
    this.messages.push(message);
    console.log(this.messages);
    return message;
  }

  identify(name: string, clientId: string) {
    this.clientToUser[clientId] = name;

    return Object.values(this.clientToUser);
  }

  getClientName(clientId: string) {
    return this.clientToUser[clientId];
  }

  createRoom(createChessRoomDto: CreateChessRoomDto) {
    return;
  }

  findAllMessages() {
    return this.messages;
  }

  join() {
    return;
  }
}
