import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class CreateAuthDto {
  @ApiProperty({
    example: swaggerExamples.auth.email,
  })
  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;

  @ApiProperty({
    example: swaggerExamples.auth.password,
  })
  @IsString()
  @IsNotEmpty({ message: messages.validation.passwordRequired })
  password: string;
}
