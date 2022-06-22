import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators';
import { ValidationPipe } from 'src/pipes/validation.pipe';

import { AuthUserDto } from '../auth/dto';
import { User } from './users.model';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @ApiOperation({ summary: 'Create user' })
  // @ApiResponse({ status: 200, type: User })
  // @UsePipes(ValidationPipe)
  // @Post()
  // create(@Body() userDto: CreateUserDto) {
  //   return this.usersService.createUser(userDto);
  // }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Post('/games')
  getAllUsers(@GetCurrentUserId() userId: string) {
    return this.usersService.getAllGames(userId);
  }

  @ApiOperation({ summary: 'Get user data' })
  @ApiResponse({ status: 200, type: [User] })
  @Post('/info/:userId')
  getUserData(
    @GetCurrentUserId() userId: string,
    @Param('userId') otherUserId: string,
  ) {
    const id = otherUserId !== 'x' ? otherUserId : userId;
    return this.usersService.getUserInfo(id);
  }

  @ApiOperation({ summary: 'Change username' })
  @ApiResponse({ status: 200, type: [User] })
  @Put('/changeUsername')
  changeUsername(
    @GetCurrentUserId() userId: string,
    @Body('name') username: string,
  ) {
    return this.usersService.changeUsername(userId, username);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get()
  getAllInitializedGames() {
    // return this.usersService.getAllInitializedGames();
  }
}
