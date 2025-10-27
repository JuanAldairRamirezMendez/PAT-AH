import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller('api')
export class RestController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { phone: string; password: string }) {
    const res = await this.authService.login(body.phone, body.password);
    if (!res) return { success: false, message: 'Invalid credentials' };
    return { success: true, token: res.token, user: res.user };
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: any) {
    // Delegate to AuthService.register so password is hashed consistently
    const res = await this.authService.register(body);
    if (!res) return { success: false, message: 'Could not create user' };
    return { success: true, user: res.user };
  }
}
