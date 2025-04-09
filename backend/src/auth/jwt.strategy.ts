// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Define the shape of your JWT payload.
 */
export interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    // Pull the secret and assert it's defined
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be set');
    }

    // Build the strategy options
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    };

    super(opts);
  }

  /**
   * `validate` is called by passport once the token is verified.
   * We declare it as a **synchronous** method (no `async`),
   * and we strongly type `payload` as `JwtPayload` to avoid any `any` usage.
   */
  validate(payload: JwtPayload): JwtPayload {
    // At this point `payload` has already been verified and typed,
    // so it's safe to return it (or a subset of it) to be attached to request.user.
    return { sub: payload.sub, username: payload.username };
  }
}
