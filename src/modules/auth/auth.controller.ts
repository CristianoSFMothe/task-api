import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAuthenticated,
  ApiOperationWithDescription,
  ApiValidationError,
  UnauthorizedSwagger,
} from '@/common/swagger';

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
  @ApiOperationWithDescription({
    summary: 'Autenticar um usuário',
    description:
      'Recebe email e senha válidos e retorna um token JWT com os dados básicos do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso',
    type: LoginResponseDto,
  })
  @ApiValidationError()
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
  @ApiAuthenticated()
  @ApiOperationWithDescription({
    summary: 'Encerrar a sessão do usuário autenticado',
    description:
      'Encerra a sessão lógica do usuário autenticado e retorna uma mensagem de confirmação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    type: LogoutResponseDto,
  })
  logout() {
    return this.authService.logout();
  }
}
