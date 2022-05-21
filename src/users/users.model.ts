import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface UserCreationAttrs {
  email: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: '1' })
  @Column({
    type: DataType.UUIDV4,
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
}
