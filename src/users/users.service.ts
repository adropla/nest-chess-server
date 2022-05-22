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
    const newUserDto = { ...userDto, id: uuidv4(), name: name };
    const user = await this.userRepository.create(newUserDto);
    return user;
  }

  async getAllUsers() {
    const allUsers = await this.userRepository.findAll();
    return allUsers;
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
