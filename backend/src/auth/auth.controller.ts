// src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignInDto, TokenResponseDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto): Promise<TokenResponseDto> {
    // Use your auth service to authenticate
    const tokenPayload = await this.authService.signIn(signInDto);
    return tokenPayload;
  }

  @Post('verify')
  @HttpCode(200)
  async verifyToken(@Body('token') token: string): Promise<{ valid: boolean }> {
    // Use your auth service to verify the token
    const isValid = await this.authService.verifyToken(token);
    return { valid: isValid };
  }
}
