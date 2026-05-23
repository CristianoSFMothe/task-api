import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class BadRequestSwagger {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.badRequestMessages,
    type: [String],
  })
  message: string[];

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;
}
