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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BadRequestSwagger } from '@/common/swagger/bad-request.swagger';
import { ConflictSwagger } from '@/common/swagger/conflict.swagger';
import { ForbiddenSwagger } from '@/common/swagger/forbidden.swagger';
import { NotFoundSwagger } from '@/common/swagger/not-found.swagger';
import { UnauthorizedSwagger } from '@/common/swagger/unauthorized.swagger';
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar os usuários ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários ativos',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
    type: ForbiddenSwagger,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find-by-email')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar um usuário por email',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do payload',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário nao encontrado',
    type: NotFoundSwagger,
  })
  findByEmail(@Body() query: FindUserByEmailDto) {
    return this.usersService.findByEmail(query.email);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  findMe(@Req() request: RequestWithUser) {
    return this.usersService.findById(request.user.userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar o nome do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Nome atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do payload',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário nao encontrado',
    type: NotFoundSwagger,
  })
  updateMyName(
    @Req() request: RequestWithUser,
    @Body() updateNameUserDto: UpdateNameUserDto,
  ) {
    return this.usersService.updateName(request.user.userId, updateNameUserDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reativar um usuário inativo',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do usuário atualizado',
    type: UpdateUserStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID invalido',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
    type: ForbiddenSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário nao encontrado',
    type: NotFoundSwagger,
  })
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.updateStatus(id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desativar um usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
    type: DeleteUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID invalido',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
    type: ForbiddenSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário nao encontrado',
    type: NotFoundSwagger,
  })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.delete(id);
  }

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Criar um novo usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário adicionado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do payload',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    type: ConflictSwagger,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
