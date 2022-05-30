import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { ChessRoomService } from './chess-room.service';
import { GameOptionsDto } from './dto/game-options.dto';

@Controller('game')
export class ChessRoomController {
  constructor(private chessRoomService: ChessRoomService) {}

  @ApiOperation({ summary: 'Create chess room via link' })
  @ApiResponse({ status: 200 })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('create-link-game')
  createLinkGame(
    @Body() gameOptions: GameOptionsDto,
    @GetCurrentUserId() authUserId: string,
  ) {
    const userId = authUserId ? authUserId : gameOptions.userId;
    return this.chessRoomService.createRoom(gameOptions, userId);
  }

  @ApiOperation({ summary: 'Join Room via link' })
  @ApiResponse({ status: 200 })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post(':roomId')
  join(
    @Param('roomId') roomId: string,
    @GetCurrentUserId() authUserId: string,
    @Body('userId') unAuthUserId: string,
  ) {
    const userId = authUserId ? authUserId : unAuthUserId;
    return this.chessRoomService.joinRoom(roomId, userId);
  }
}
