import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class CreateTaskDto {
  @ApiProperty({
    example: swaggerExamples.task.title,
  })
  @IsString()
  @IsNotEmpty({ message: messages.validation.taskTitleRequired })
  title: string;

  @ApiPropertyOptional({
    example: swaggerExamples.task.description,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: swaggerExamples.task.tags,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: swaggerExamples.user.email,
    description:
      'Email do usuário dono da tarefa. Apenas administradores podem informar um email diferente do usuário autenticado.',
  })
  @IsOptional()
  @IsEmail({}, { message: messages.validation.emailInvalid })
  userEmail?: string;

  @ApiPropertyOptional({
    example: swaggerExamples.user.email,
    description: 'Email do responsável pela tarefa.',
  })
  @IsOptional()
  @IsEmail({}, { message: messages.validation.emailInvalid })
  responsibleEmail?: string;
}
