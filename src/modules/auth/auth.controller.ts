import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BadRequestSwagger } from '@/common/swagger/bad-request.swagger';
import { UnauthorizedSwagger } from '@/common/swagger/unauthorized.swagger';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar um usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do payload',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou senha inválidos',
    type: UnauthorizedSwagger,
  })
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encerrar a sessão do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário nao autenticado',
    type: UnauthorizedSwagger,
  })
  logout() {
    return this.authService.logout();
  }
}
