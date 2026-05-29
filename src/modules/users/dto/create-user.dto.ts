import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @MaxLength(20, { message: messages.validation.passwordMaxLength })
  @Matches(/[a-z]/, { message: messages.validation.passwordLowercase })
  @Matches(/[A-Z]/, { message: messages.validation.passwordUppercase })
  @Matches(/\d/, { message: messages.validation.passwordNumber })
  @Matches(/[^A-Za-z0-9]/, { message: messages.validation.passwordSpecialChar })
  password: string;
}
