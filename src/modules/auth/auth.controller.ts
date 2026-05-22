import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import type { UserRole } from '@/database/schema/users.schema';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateAuthDto } from './dto/create-auth.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @Get('me')
  getProfile(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
