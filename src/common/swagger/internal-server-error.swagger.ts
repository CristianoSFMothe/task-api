import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from './swagger-examples';

export class InternalServerErrorSwagger {
  @ApiProperty({
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    example: swaggerExamples.errors.internalServerErrorMessage,
  })
  message: string;

  @ApiProperty({
    example: 'Internal Server Error',
  })
  error: string;
}
