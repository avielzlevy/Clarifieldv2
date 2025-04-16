// src/auth/auth.controller.ts

import { Body, Controller, HttpCode, Post, Headers, Get } from '@nestjs/common';
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

  //verify has to be a GET request and token will be passed in the header Authorization
  @Get('verify')
  async verifyToken(
    @Headers('Authorization') token: string,
  ): Promise<{ valid: boolean }> {
    // Use your auth service to verify the token
    const isValid = await this.authService.verifyToken(token);
    return { valid: isValid };
  }
}
