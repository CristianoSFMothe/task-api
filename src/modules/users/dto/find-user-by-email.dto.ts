import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class FindUserByEmailDto {
  @ApiProperty({
    example: swaggerExamples.user.email,
  })
  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;
}
