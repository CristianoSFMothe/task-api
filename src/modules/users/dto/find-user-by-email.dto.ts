import { IsEmail, IsNotEmpty } from 'class-validator';

import { messages } from '@/common/messages';

export class FindUserByEmailDto {
  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;
}
