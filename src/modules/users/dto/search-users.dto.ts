import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class SearchUsersDto {
  @ApiPropertyOptional({
    example: swaggerExamples.user.name,
    description: 'Busca parcial por nome.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: swaggerExamples.user.email,
    description: 'Busca exata por email.',
  })
  @IsOptional()
  @IsEmail({}, { message: messages.validation.emailInvalid })
  email?: string;
}
