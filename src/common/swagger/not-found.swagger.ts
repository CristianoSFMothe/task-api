import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class NotFoundSwagger {
  @ApiProperty({
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.notFoundMessage,
  })
  message: string;

  @ApiProperty({
    example: 'Not Found',
  })
  error: string;
}
