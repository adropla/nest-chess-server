import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';

import { GameOptionsDto } from './dto/game-options.dto';
import { ChessRoom } from './chess-room.model';
import { TChessRoom } from './types';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChessRoomService {
  constructor(
    @InjectModel(ChessRoom) private chessRoomRepository: typeof ChessRoom,
  ) {}

  async createRoom(gameOptions: GameOptionsDto, userId: string) {
    const newChessRoom: TChessRoom = {
      ...gameOptions,
      roomId: uuidv4(),
      blackPlayerId: null,
      whitePlayerId: null,
      fen: [],
    };
    if (Math.random() >= 0.5) {
      newChessRoom.whitePlayerId = userId;
    } else {
      newChessRoom.blackPlayerId = userId;
    }
    const chessRoom = await this.chessRoomRepository.create(newChessRoom);
    return {
      roomId: chessRoom.roomId,
      url: `/game/${chessRoom.roomId}`,
    };
  }

  async joinRoom(roomId: string, userId: string) {
    const chessRoom = await this.chessRoomRepository.findOne({
      where: { roomId },
      include: { all: true },
    });
    if (chessRoom) {
      const anotherSide = chessRoom.whitePlayerId
        ? 'blackPlayerId'
        : 'whitePlayerId';
      if (
        (!chessRoom.whitePlayerId || !chessRoom.blackPlayerId) &&
        chessRoom.whitePlayerId !== userId &&
        chessRoom.blackPlayerId !== userId
      ) {
        chessRoom[anotherSide] = userId;
        chessRoom.save();
      }
      if (
        userId === chessRoom.whitePlayerId ||
        userId === chessRoom.blackPlayerId
      ) {
        const userSide =
          chessRoom.whitePlayerId === userId
            ? 'whitePlayerId'
            : 'blackPlayerId';
        const opponentSide =
          userSide === 'whitePlayerId' ? 'blackPlayerId' : 'whitePlayerId';

        return {
          side: userSide[0],
          roomId,
          userId,
          fen: chessRoom.fen,
          opponentId: chessRoom[opponentSide],
        };
      }
    }

    throw new ForbiddenException('Access denied');
  }

  async findAllMessages(roomId: string) {
    const room = await this.chessRoomRepository.findOne({
      where: {
        roomId: roomId,
      },
      include: { all: true },
    });
    console.log(room.fen);
    return room.fen;
  }

  async addFenMove(createMessageDto: CreateMessageDto) {
    const room = await this.chessRoomRepository.findOne({
      where: {
        roomId: createMessageDto.roomId,
      },
      include: { all: true },
    });
    const localFen = [...room.fen];
    localFen.push(createMessageDto.message);
    room.update(
      {
        fen: localFen,
      },
      {
        where: {
          roomId: createMessageDto.roomId,
        },
      },
    );
    console.log(room);
    return room;
  }
}
