import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class LogoutResponseDto {
  @ApiProperty({
    example: swaggerExamples.auth.logoutMessage,
  })
  message: string;
}
