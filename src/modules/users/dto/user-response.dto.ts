import { ApiProperty } from '@nestjs/swagger';

import { swaggerExamples } from '@/common/swagger/swagger-examples';

export class UserResponseDto {
  @ApiProperty({
    example: swaggerExamples.user.id,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: swaggerExamples.user.name,
  })
  name: string;

  @ApiProperty({
    example: swaggerExamples.user.email,
  })
  email: string;
}

export class UserWithRoleResponseDto extends UserResponseDto {
  @ApiProperty({
    example: swaggerExamples.user.role,
    enum: ['USER', 'ADMIN'],
  })
  role: 'USER' | 'ADMIN';
}

export class DeleteUserResponseDto {
  @ApiProperty({
    example: swaggerExamples.user.id,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: swaggerExamples.user.deletedMessage,
  })
  message: string;
}

export class UpdateUserStatusResponseDto {
  @ApiProperty({
    example: swaggerExamples.user.inactiveId,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: swaggerExamples.user.statusUpdatedMessage,
  })
  message: string;
}
