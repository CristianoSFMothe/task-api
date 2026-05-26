import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

import { taskStatusValues } from '../schemas/task.schema';

export class FindTasksDto {
  @ApiPropertyOptional({
    example: swaggerExamples.task.title,
    description: 'Filtra tarefas por título usando busca parcial.',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: taskStatusValues,
  })
  @IsOptional()
  @IsEnum(taskStatusValues)
  status?: (typeof taskStatusValues)[number];

  @ApiPropertyOptional({
    example: swaggerExamples.task.tags[0],
    description: 'Filtra tarefas que contenham a tag informada.',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    example: swaggerExamples.user.id,
    format: 'uuid',
    description: 'Filtra tarefas pelo responsável.',
  })
  @IsOptional()
  @IsUUID()
  responsibleId?: string;
}
