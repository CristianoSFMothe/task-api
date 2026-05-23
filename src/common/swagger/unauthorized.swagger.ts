import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class UnauthorizedSwagger {
  @ApiProperty({
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.unauthorizedMessage,
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized',
  })
  error: string;
}
