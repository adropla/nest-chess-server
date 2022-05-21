import { Module } from '@nestjs/common';
import { ChessRoomService } from './chess-room.service';
import { ChessRoomGateway } from './chess-room.gateway';

@Module({
  providers: [ChessRoomGateway, ChessRoomService],
})
export class ChessRoomModule {}
