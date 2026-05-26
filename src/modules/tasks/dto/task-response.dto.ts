import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

import { taskStatusValues } from '../schemas/task.schema';

export class TaskResponseDto {
  @ApiProperty({
    example: '8f0506ab-70d3-4aab-bec9-6bd22fba8a70',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: swaggerExamples.task.title,
  })
  title: string;

  @ApiProperty({
    example: swaggerExamples.task.description,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: swaggerExamples.task.tags,
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    example: 'PENDING',
    enum: taskStatusValues,
  })
  status: (typeof taskStatusValues)[number];

  @ApiProperty({
    example: swaggerExamples.user.name,
  })
  createdBy: string;

  @ApiProperty({
    example: swaggerExamples.user.id,
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    example: swaggerExamples.user.id,
    format: 'uuid',
    nullable: true,
  })
  responsibleId: string | null;
}
