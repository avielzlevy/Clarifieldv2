// src/auth/dto/auth.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sign‑in requests.
 * This enforces that incoming JSON contains non‑empty string values for username and password.
 */
export class SignInDto {
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString({ message: 'Username must be a string.' })
  @ApiProperty({ description: 'The username of the user.' })
  username!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @ApiProperty({ description: 'The password of the user.' })
  password!: string;
}

/**
 * DTO for returning token responses.
 * The token is created after successful authentication.
 */
export class TokenResponseDto {
  @IsString()
  @ApiProperty({
    description: 'The access token for the authenticated user.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'Username of the authenticated user.',
    example: 'john_doe',
  })
  @IsString()
  username!: string;
}
