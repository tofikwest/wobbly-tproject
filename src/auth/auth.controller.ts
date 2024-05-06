import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async login(@Body() { email, password }: LoginDto) {
    try {
      const { accessToken } = await this.authService.login(email, password);

      return {
        message: 'User logged in successfully',
        accessToken,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  @Post('signup')
  async register(@Body() userObj: RegisterDto) {
    try {
      const { email, password } = userObj;
      const user = await this.authService.register(email, password);

      return {
        message: 'User registered successfully',
        user,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: error.message,
        statusCode: error.statusCode,
      };
    }
  }
}
