import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAdminAccess,
  ApiAuthenticated,
  ApiNotFound,
  ApiOperationWithDescription,
  ApiUuidParam,
  ApiValidationError,
  ConflictSwagger,
} from '@/common/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import { CreateUserDto } from './dto/create-user.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { UpdateNameUserDto } from './dto/update-name-user.dto';
import {
  DeleteUserResponseDto,
  UpdateUserStatusResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get()
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Listar os usuários ativos',
    description:
      'Retorna todos os usuários com status ativo. Esta rota exige autenticação e perfil de administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários ativos',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiAdminAccess()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find-by-email')
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Buscar um usuário por email',
    description:
      'Busca um usuário ativo a partir do email informado no corpo da requisição.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseDto,
  })
  @ApiValidationError()
  @ApiNotFound()
  findByEmail(@Body() query: FindUserByEmailDto) {
    return this.usersService.findByEmail(query.email);
  }

  @Get('me')
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Obter os dados do usuário autenticado',
    description:
      'Retorna os dados básicos do usuário associado ao token enviado na requisição.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado',
    type: UserResponseDto,
  })
  findMe(@Req() request: RequestWithUser) {
    return this.usersService.findById(request.user.userId);
  }

  @Patch('me')
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Atualizar o nome do usuário autenticado',
    description:
      'Atualiza apenas o nome do usuário autenticado com base no token enviado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nome atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiValidationError()
  @ApiNotFound()
  updateMyName(
    @Req() request: RequestWithUser,
    @Body() updateNameUserDto: UpdateNameUserDto,
  ) {
    return this.usersService.updateName(request.user.userId, updateNameUserDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Reativar um usuário inativo',
    description:
      'Reativa um usuário inativo a partir do UUID informado. Esta rota exige autenticação e perfil de administrador.',
  })
  @ApiUuidParam('id', 'UUID do usuário que será reativado')
  @ApiResponse({
    status: 200,
    description: 'Status do usuário atualizado',
    type: UpdateUserStatusResponseDto,
  })
  @ApiValidationError('UUID inválido')
  @ApiAdminAccess()
  @ApiNotFound()
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.updateStatus(id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Desativar um usuário',
    description:
      'Realiza a exclusão lógica de um usuário a partir do UUID informado. Esta rota exige autenticação e perfil de administrador.',
  })
  @ApiUuidParam('id', 'UUID do usuário que será desativado')
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
    type: DeleteUserResponseDto,
  })
  @ApiValidationError('UUID inválido')
  @ApiAdminAccess()
  @ApiNotFound()
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.delete(id);
  }

  @Public()
  @Post()
  @ApiOperationWithDescription({
    summary: 'Criar um novo usuário',
    description:
      'Cria um novo usuário com nome, email e senha válidos, retornando os dados públicos do registro criado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário adicionado com sucesso',
    type: UserResponseDto,
  })
  @ApiValidationError()
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    type: ConflictSwagger,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
