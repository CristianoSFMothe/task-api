import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { messages } from '@/common/messages';
import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class FindUserByNameDto {
  @ApiProperty({
    example: swaggerExamples.user.name,
  })
  @IsString()
  @IsNotEmpty({ message: messages.validation.nameRequired })
  name: string;
}
