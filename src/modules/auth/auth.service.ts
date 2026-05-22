import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { UserAuthResponse } from '@/modules/users/users.service';
import { UsersService } from '@/modules/users/users.service';

import { CreateAuthDto } from './dto/create-auth.dto';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserAuthResponse['role'];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto): Promise<{ access_token: string }> {
    let user: UserAuthResponse;

    try {
      user = await this.usersService.findByEmail(createAuthDto.email, {
        includePassword: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      throw error;
    }

    const passwordMatches = await bcrypt.compare(
      createAuthDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
