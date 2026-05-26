import { PartialType, PickType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

import { CreateTaskDto } from './create-task.dto';

class UpdateTaskBaseDto extends PartialType(
  PickType(CreateTaskDto, ['title', 'description', 'tags'] as const),
) {}

export class UpdateTaskDto extends UpdateTaskBaseDto {
  @ApiPropertyOptional({
    example: swaggerExamples.user.id,
    format: 'uuid',
    nullable: true,
    description:
      'UUID do responsável pela tarefa. Informe null para remover o responsável.',
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID()
  responsibleId?: string | null;
}
