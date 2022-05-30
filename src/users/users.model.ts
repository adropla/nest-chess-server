import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface UserCreationAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: 'UUIDv4' })
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({ example: 'hashed jwt' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  hashedRefreshToken: string;

  @ApiProperty({ example: 'user' })
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  name: string;

  @ApiProperty({ example: '1234567890' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ApiProperty({ example: '["uuidv4", "uuidv4", "uuidv4"]' })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  games: string[];

  @ApiProperty({ example: '800' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rating: number;
}
