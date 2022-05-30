import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GameOptionsDto {
  @ApiProperty({ example: '2|1' })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty()
  readonly timeMode: '1' | '1|1' | '2|1' | '3' | '3|2' | '5' | '10' | '30';

  @ApiProperty({ example: 'uuidv4 from client side' })
  @IsString({ message: 'Должно быть строкой' })
  readonly userId: string;
}
