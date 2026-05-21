import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserByEmailDto {
  @IsEmail({}, { message: 'Informe um email válido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;
}
