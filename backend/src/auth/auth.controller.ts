// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  HttpCode,
  Post,
  Headers,
  Get,
  UseGuards,
} from '@nestjs/common';
import { SignInDto, TokenResponseDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in to the application',
    description: 'Authenticate user and return a token.',
  })
  @ApiBody({
    type: SignInDto,
    description: 'User credentials for signing in',
  })
  @ApiResponse({
    status: 200,
    description: 'Token response containing the access token.',
  })
  async signIn(@Body() signInDto: SignInDto): Promise<TokenResponseDto> {
    // Use your auth service to authenticate
    const tokenPayload = await this.authService.signIn(signInDto);
    return tokenPayload;
  }

  //verify has to be a GET request and token will be passed in the header Authorization
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiOperation({
    summary: 'Verify the validity of a token',
    description: 'Checks if the provided token is valid.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid token.',
  })
  @ApiBearerAuth()
  async verifyToken(
    @Headers('Authorization') token: string,
  ): Promise<{ valid: boolean }> {
    // Use your auth service to verify the token
    const isValid = await this.authService.verifyToken(token);
    return { valid: isValid };
  }
}
