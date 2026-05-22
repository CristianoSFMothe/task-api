import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { messages } from '@/common/messages';

export class CreateAuthDto {
  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;

  @IsString()
  @IsNotEmpty({ message: messages.validation.passwordRequired })
  password: string;
}
