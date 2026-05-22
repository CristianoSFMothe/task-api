import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { messages } from '@/common/messages';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: messages.validation.nameRequired })
  name: string;

  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;

  @IsString()
  @IsNotEmpty({ message: messages.validation.passwordRequired })
  @MinLength(6, { message: messages.validation.passwordMinLength })
  password: string;
}
