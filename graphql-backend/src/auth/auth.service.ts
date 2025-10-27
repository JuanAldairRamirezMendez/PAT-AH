import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    try {
      const user = await this.usersService.create({ ...data, password: hashed });
      const token = this.signToken(user.id);
      delete (user as any).password;
      return { token, user };
    } catch (err: any) {
      // Handle Prisma unique constraint error (P2002) and surface a clear HTTP error
      if (err?.code === 'P2002') {
        throw new HttpException('A user with that email or phone already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Could not create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) return null;
    const ok = await bcrypt.compare(password, (user as any).password || '');
    if (!ok) return null;
    const token = this.signToken((user as any).id);
    delete (user as any).password;
    return { token, user };
  }

  signToken(userId: string) {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    return jwt.sign({ sub: userId }, secret, { expiresIn: '1d' } as any);
  }
}
