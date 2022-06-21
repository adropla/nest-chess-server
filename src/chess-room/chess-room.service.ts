import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';

import { GameOptionsDto } from './dto/game-options.dto';
import { ChessRoom } from './chess-room.model';
import { TChessRoom } from './types';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChessRoomService {
  constructor(
    @InjectModel(ChessRoom) private chessRoomRepository: typeof ChessRoom,
    private userService: UsersService,
  ) {}
  private readonly chessGame = Chess();

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
      url: `${chessRoom.roomId}`,
    };
  }

  async gameIsOver(roomId: string) {
    const chessRoom = await this.chessRoomRepository.findOne({
      where: { roomId },
      include: { all: true },
    });
    if (chessRoom) {
      if (chessRoom.winner) {
        return {
          isDraw: false,
          winner: chessRoom.winner,
        };
      }
      if (chessRoom.isDraw) {
        return {
          isDraw: true,
          winner: null,
        };
      }
    }
    return false;
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
        await chessRoom.save();
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

  async giveUp(roomId: string, userId: string) {
    const room = await this.chessRoomRepository.findOne({
      where: {
        roomId,
      },
      include: { all: true },
    });
    const winnerSide =
      userId === room.whitePlayerId ? 'blackPlayerId' : 'whitePlayerId';
    const winnerId = room[winnerSide];
    const loserId =
      room[winnerSide === 'blackPlayerId' ? 'whitePlayerId' : 'blackPlayerId'];
    await room.update(
      {
        winner: winnerId,
        isDraw: false,
      },
      {
        where: {
          roomId,
        },
      },
    );
    try {
      await this.userService.changeRating(winnerId, loserId);
    } catch {}
    return {
      isDraw: false,
      winner: winnerId,
      winnerColor: winnerSide,
    };
  }

  async isGameOver(createMessageDto: CreateMessageDto) {
    const room = await this.chessRoomRepository.findOne({
      where: {
        roomId: createMessageDto.roomId,
      },
      include: { all: true },
    });
    this.chessGame.load(createMessageDto.message);
    if (this.chessGame.in_draw()) {
      await room.update(
        {
          isDraw: true,
        },
        {
          where: {
            roomId: createMessageDto.roomId,
          },
        },
      );
      return {
        isDraw: true,
        winner: null,
      };
    }
    if (this.chessGame.in_checkmate()) {
      const side = createMessageDto.messageTurn;
      const winnerSide = side === 'b' ? 'blackPlayerId' : 'whitePlayerId';
      const winnerId = room[winnerSide];
      const loserId =
        room[
          winnerSide === 'blackPlayerId' ? 'whitePlayerId' : 'blackPlayerId'
        ];
      await room.update(
        {
          winner: winnerId,
          isDraw: false,
        },
        {
          where: {
            roomId: createMessageDto.roomId,
          },
        },
      );
      try {
        await this.userService.changeRating(winnerId, loserId);
      } catch {}
      return {
        isDraw: false,
        winner: winnerId,
        winnerColor: winnerSide,
      };
    }
    return false;
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
    await room.update(
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
