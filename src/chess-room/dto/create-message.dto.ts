import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: '2|1' })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty()
  readonly roomId: string;

  @ApiProperty({ example: 'uuidv4 from client side' })
  @IsString({ message: 'Должно быть строкой' })
  readonly userId: string;

  @ApiProperty({ example: 'message' })
  @IsString({ message: 'Должно быть строкой' })
  readonly message: string;

  @ApiProperty({ example: 'turn black or white' })
  @IsString({ message: 'Должно быть строкой' })
  readonly messageTurn: 'w' | 'b';
}
