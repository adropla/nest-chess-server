import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface ChessRoomCreationAttrs {
  whitePlayerId: string;
  blackPlayerId: string;
  roomId: string;
}

@Table({ tableName: 'chessroom' })
export class ChessRoom extends Model<ChessRoom, ChessRoomCreationAttrs> {
  @ApiProperty({ example: 'uuidv4' })
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  roomId: string;

  @ApiProperty({ example: 'uuidv4' })
  @Column({
    type: DataType.STRING,
    unique: false,
    primaryKey: false,
    allowNull: true,
  })
  whitePlayerId: string;

  @ApiProperty({ example: 'uuidv4' })
  @Column({
    type: DataType.STRING,
    unique: false,
    primaryKey: false,
    allowNull: true,
  })
  blackPlayerId: string;

  @ApiProperty({ example: '5' })
  @Column({
    type: DataType.STRING,
    unique: false,
    primaryKey: false,
    allowNull: false,
  })
  timeMode: string;

  @ApiProperty({ example: 'false' })
  @Column({
    type: DataType.BOOLEAN,
    unique: false,
    primaryKey: false,
    allowNull: true,
  })
  isDraw: boolean;

  @ApiProperty({ example: 'white player or black player' })
  @Column({
    type: DataType.STRING,
    unique: false,
    primaryKey: false,
    allowNull: true,
  })
  winner: string;

  @ApiProperty({
    example: '[rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq f3 0 1]',
  })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    unique: false,
    primaryKey: false,
    allowNull: true,
  })
  fen: string[];
}
