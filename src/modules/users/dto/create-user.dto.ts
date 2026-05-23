import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class CreateUserDto {
  @ApiProperty({
    example: swaggerExamples.user.name,
  })
  @IsString()
  @IsNotEmpty({ message: messages.validation.nameRequired })
  name: string;

  @ApiProperty({
    example: swaggerExamples.user.email,
  })
  @IsEmail({}, { message: messages.validation.emailInvalid })
  @IsNotEmpty({ message: messages.validation.emailRequired })
  email: string;

  @ApiProperty({
    example: swaggerExamples.auth.password,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: messages.validation.passwordRequired })
  @MinLength(6, { message: messages.validation.passwordMinLength })
  password: string;
}
