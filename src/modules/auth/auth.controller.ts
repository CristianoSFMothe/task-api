import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAuthenticated,
  ApiOperationWithDescription,
  ApiServerErrorResponse,
  ApiValidationError,
  UnauthorizedSwagger,
} from '@/common/swagger';

import { authDocumentation } from './auth.documentation';
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
  @ApiOperationWithDescription(authDocumentation.login)
  @ApiResponse({
    status: 200,
    description: authDocumentation.login.successDescription,
    type: LoginResponseDto,
  })
  @ApiValidationError()
  @ApiResponse({
    status: 401,
    description: authDocumentation.login.unauthorizedDescription,
    type: UnauthorizedSwagger,
  })
  @ApiServerErrorResponse()
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiAuthenticated()
  @ApiOperationWithDescription(authDocumentation.logout)
  @ApiResponse({
    status: 200,
    description: authDocumentation.logout.successDescription,
    type: LogoutResponseDto,
  })
  @ApiServerErrorResponse()
  logout() {
    return this.authService.logout();
  }
}
