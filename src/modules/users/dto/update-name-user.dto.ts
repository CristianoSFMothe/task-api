import { IsNotEmpty, IsString } from 'class-validator';

import { messages } from '@/common/messages';

export class UpdateNameUserDto {
  @IsString()
  @IsNotEmpty({ message: messages.validation.nameRequired })
  name: string;
}
