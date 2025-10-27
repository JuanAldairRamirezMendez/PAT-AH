import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { telefono: phone } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
