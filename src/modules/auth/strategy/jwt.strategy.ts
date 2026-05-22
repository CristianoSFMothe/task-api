import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { messages } from '@/common/messages';
import type { EnvVariables } from '@/config/env';
import type { UserRole } from '@/database/schema/users.schema';
import { UsersService } from '@/modules/users/users.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<EnvVariables, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService
      .findById(payload.sub, { includeRole: true })
      .catch(() => null);

    if (!user) {
      throw new UnauthorizedException(messages.auth.invalidToken);
    }

    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
