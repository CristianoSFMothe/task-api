import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;
}
