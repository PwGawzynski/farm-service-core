import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDataDto } from './dto/user-data.dto';
import { Request } from 'express';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { Public } from '../../decorators/auth.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * auth/login req, serves login asks
   * @param userPayload data transferred as JSON in req body
   * @return data object with access token and refresh token
   */
  @Post('login')
  @Public()
  async login(@Body() userPayload: UserDataDto) {
    return this.authService.login(userPayload);
  }

  /**
   * auth/refresh this method serves refresh token ask
   * auth/refresh this method serves refresh token ask
   * @param req express type request object taken by decorator
   * @return data object with access token and refresh token
   */
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @Public()
  @Post('g-login')
  async googleLogin(@Query('id-token') idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @Public()
  @Get('exist')
  isMailFree(@Query('email') email: string) {
    return this.authService.isMailFree(email);
  }
}
