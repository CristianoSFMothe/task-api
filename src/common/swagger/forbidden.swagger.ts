import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class ForbiddenSwagger {
  @ApiProperty({
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.forbiddenMessage,
  })
  message: string;

  @ApiProperty({
    example: 'Forbidden',
  })
  error: string;
}
