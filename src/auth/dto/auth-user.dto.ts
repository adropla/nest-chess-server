import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail } from 'class-validator';

export class AuthUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
  @ApiProperty({ example: '1231321312' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(8, 32, {
    message: 'Пароль должен быть не менее 8 символов и не более 32 символов',
  })
  readonly password: string;
}
