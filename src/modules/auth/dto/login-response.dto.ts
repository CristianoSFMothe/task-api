import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class LoginResponseDto {
  @ApiProperty({
    example: swaggerExamples.auth.accessToken,
  })
  access_token: string;

  @ApiProperty({
    example: swaggerExamples.user.id,
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    example: swaggerExamples.user.name,
  })
  name: string;

  @ApiProperty({
    example: swaggerExamples.user.email,
  })
  email: string;
}
