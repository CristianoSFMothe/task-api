import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class ConflictSwagger {
  @ApiProperty({
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.conflictMessage,
  })
  message: string;

  @ApiProperty({
    example: 'Conflict',
  })
  error: string;
}
