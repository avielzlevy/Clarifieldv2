// src/auth/auth.service.ts
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client } from 'ldapts';
import { SignInDto } from './auth.dto';

interface LdapConfig {
  url: string;
  baseDN: string;
  domainSuffix: string;
  allowedGroups: string[];
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private async ldapAuthenticate(
    username: string,
    password: string,
    ldapConfig: LdapConfig,
  ): Promise<boolean> {
    const client = new Client({
      url: ldapConfig.url,
      timeout: 0,
      connectTimeout: 0,
      tlsOptions: {
        minVersion: 'TLSv1.2',
      },
      strictDN: true,
    });

    const userDN = `${username}${ldapConfig.domainSuffix}`;
    try {
      await client.bind(userDN, password);
      const { searchEntries } = await client.search(ldapConfig.baseDN, {
        scope: 'sub',
        filter: `(sAMAccountName=${username})`,
        attributes: ['memberOf'],
      });

      if (!searchEntries || searchEntries.length === 0) {
        throw new NotFoundException('User not found');
      }

      // Extract memberOf attribute. It may be a string or array.
      const entry = searchEntries[0] as { memberOf?: string | string[] };
      let userGroups: string[] = [];
      if (entry.memberOf) {
        userGroups = Array.isArray(entry.memberOf)
          ? entry.memberOf
          : [entry.memberOf];
      }

      // Check if user is in one of the allowed groups.
      const inAllowedGroup = ldapConfig.allowedGroups.some((allowedGroup) =>
        userGroups.some((group) => group.includes(allowedGroup)),
      );
      if (!inAllowedGroup) {
        throw new ForbiddenException('User is not in an allowed group');
      }
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return false;
    } finally {
      await client.unbind();
    }
  }

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ token: string; username: string }> {
    const { username, password } = signInDto;
    const useLDAP = process.env.LDAP_AUTH === 'true';

    // Ensure required env variables are present when LDAP auth is enabled
    if (
      useLDAP &&
      (!process.env.LDAP_URL ||
        !process.env.LDAP_BASE_DN ||
        !process.env.LDAP_DOMAIN_SUFFIX ||
        !process.env.LDAP_ALLOWED_GROUPS)
    ) {
      throw new InternalServerErrorException(
        'LDAP is enabled but LDAP_URL, LDAP_BASE_DN, LDAP_DOMAIN_SUFFIX, or LDAP_ALLOWED_GROUPS is not set',
      );
    }

    const ldapConfig: LdapConfig = {
      url: process.env.LDAP_URL || 'ldap://localhost',
      baseDN: process.env.LDAP_BASE_DN || 'DC=example,DC=com',
      domainSuffix: process.env.LDAP_DOMAIN_SUFFIX || '@example.com',
      allowedGroups: process.env.LDAP_ALLOWED_GROUPS
        ? process.env.LDAP_ALLOWED_GROUPS.split(',')
        : [],
    };

    let authenticated = false;
    if (useLDAP) {
      try {
        authenticated = await this.ldapAuthenticate(
          username,
          password,
          ldapConfig,
        );
      } catch {
        // Fallback local authentication (for development)
        authenticated = username === 'admin' && password === 'password';
      }
    } else {
      // Local authentication (only for development/testing)
      authenticated = username === 'admin' && password === 'password';
    }

    if (!authenticated) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username };
    // Generate a token that expires in 1 hour. (Adjust options as needed.)
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { token, username };
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token);
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return false;
    }
  }
}
