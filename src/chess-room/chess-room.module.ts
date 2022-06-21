import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChessRoomGateway } from './chess-room.gateway';
import { ChessRoomController } from './chess-room.controller';
import { ChessRoomService } from './chess-room.service';
import { ChessRoom } from './chess-room.model';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ChessRoomController],
  providers: [ChessRoomService, ChessRoomGateway],
  imports: [SequelizeModule.forFeature([ChessRoom]), UsersModule],
})
export class ChessRoomModule {}
