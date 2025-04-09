// src/auth/dto/auth.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for sign‑in requests.
 * This enforces that incoming JSON contains non‑empty string values for username and password.
 */
export class SignInDto {
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString({ message: 'Username must be a string.' })
  username!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  password!: string;
}

/**
 * DTO for returning token responses.
 * The token is created after successful authentication.
 */
export class TokenResponseDto {
  @IsString()
  token!: string;

  @IsString()
  username!: string;
}
