import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

import { taskStatusValues } from '../schemas/task.schema';

export class UpdateTaskStatusDto {
  @ApiProperty({
    example: swaggerExamples.task.status,
    enum: taskStatusValues,
  })
  @IsEnum(taskStatusValues)
  status: (typeof taskStatusValues)[number];
}
