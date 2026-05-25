import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { BadRequestSwagger } from './bad-request.swagger';
import { ForbiddenSwagger } from './forbidden.swagger';
import { InternalServerErrorSwagger } from './internal-server-error.swagger';
import { NotFoundSwagger } from './not-found.swagger';
import { UnauthorizedSwagger } from './unauthorized.swagger';

type OperationMetadata = {
  summary: string;
  description: string;
};

export function ApiOperationWithDescription(
  metadata: OperationMetadata,
): MethodDecorator {
  return ApiOperation(metadata);
}

export function ApiAuthenticated(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description: 'Usuário não autenticado',
      type: UnauthorizedSwagger,
    }),
  );
}

export function ApiAdminAccess(): MethodDecorator {
  return ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
    type: ForbiddenSwagger,
  });
}

export function ApiValidationError(
  description = 'Erro de validação do payload',
): MethodDecorator {
  return ApiResponse({
    status: 400,
    description,
    type: BadRequestSwagger,
  });
}

export function ApiUuidParam(
  name = 'id',
  description = 'Identificador único do usuário',
): MethodDecorator {
  return ApiParam({
    name,
    description,
    format: 'uuid',
    example: '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
  });
}

export function ApiNotFound(
  description = 'Usuário não encontrado',
): MethodDecorator {
  return ApiResponse({
    status: 404,
    description,
    type: NotFoundSwagger,
  });
}

export function ApiServerErrorResponse(
  description = 'Erro interno do servidor',
): MethodDecorator {
  return ApiResponse({
    status: 500,
    description,
    type: InternalServerErrorSwagger,
  });
}
