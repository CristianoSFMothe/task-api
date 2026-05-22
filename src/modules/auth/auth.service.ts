import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { messages } from '@/common/messages';
import type { UserAuthResponse } from '@/modules/users/users.service';
import { UsersService } from '@/modules/users/users.service';

import { CreateAuthDto } from './dto/create-auth.dto';
import { loginSchema } from './schemas/auth.schema';

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
    const data = loginSchema.parse(createAuthDto);

    let user: UserAuthResponse;

    try {
      user = await this.usersService.findByEmail(data.email, {
        includePassword: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(messages.auth.invalidCredentials);
      }

      throw error;
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(messages.auth.invalidCredentials);
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
