import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  login(@Body() userPayload: UserDataDto) {
    return this.authService.login(userPayload);
  }

  /**
   * auth/refresh this method serves refresh token ask
   * @param req express type request object taken by decorator
   * @return data object with access token and refresh token
   */
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }
}
