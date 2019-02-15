import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  HttpCode
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';
import { Observable } from 'rxjs';
import { AuthenticationDataDto } from '../data';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login */
  @Post('login')
  @HttpCode(200)
  authenticate(@Body() body: AuthenticationDataDto): Observable<any> {
    return this.authService.signIn(body);
  }

  @Get('data')
  @UseGuards(AuthGuard())
  findAll() {
    // This route is restricted by AuthGuard
    // JWT strategy
    return 'jobs done';
  }

  /** Add new user */
  @Post('add')
  @HttpCode(201)
  addUser(@Body() body: AuthenticationDataDto) {
    const createdDto = this.authService.addUser(body);
    return createdDto;
  }

  /** Verify token for Authorization Guard */
  @Post('check-token')
  @HttpCode(200)
  checkToken(@Body() { token }) {
    // This route is restricted by AuthGuard
    // JWT strategy
    const checked = this.authService.verifyToken(token);
    return checked;
  }
}
