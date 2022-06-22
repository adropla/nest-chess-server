import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';

import { AuthUserDto } from '../auth/dto';

import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(userDto: AuthUserDto) {
    const endIndexOfFirstPartEmail = userDto.email.indexOf('@');
    const name = userDto.email.slice(0, endIndexOfFirstPartEmail);
    const newUserDto = { ...userDto, id: uuidv4(), name: name, rating: 800 };
    const user = await this.userRepository.create(newUserDto);
    return user;
  }

  async getAllGames(userId: string) {
    const user = await this.getUserById(userId);
    return user.games;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      include: { all: true },
    });
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
    return user;
  }

  async changeRating(winnerId: string, loserId: string) {
    const winner = await this.getUserById(winnerId);
    const loser = await this.getUserById(loserId);
    const ratingDifference =
      Math.round(Math.abs(winner.rating - loser.rating) / 2) + 3;
    await this.userRepository.update(
      { rating: winner.rating + ratingDifference },
      {
        where: { id: winnerId },
      },
    );
    await this.userRepository.update(
      { rating: loser.rating - ratingDifference },
      {
        where: { id: loserId },
      },
    );
  }

  async addGame(id: string, roomId: string) {
    const user = await this.getUserById(id);
    const games = user.games || [];
    games.push(roomId);
    const uniqueGames = [...new Set(games)];
    console.log(games);
    await this.userRepository.update(
      { games: uniqueGames },
      {
        where: { id },
      },
    );
  }

  async getUserInfo(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
    return {
      name: user.name,
      games: user.games,
      rating: user.rating,
      userId: user.id,
    };
  }

  async changeUsername(id: string, username: string) {
    console.log(id);
    console.log(username);
    await this.userRepository.update(
      { name: username },
      {
        where: {
          id: id,
        },
      },
    );
    const user = await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
    return {
      name: user.name,
    };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.userRepository.update(
      { hashedRefreshToken: refreshToken },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async setRefreshTokenNull(id: string) {
    await this.userRepository.update(
      {
        hashedRefreshToken: null,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }
}
