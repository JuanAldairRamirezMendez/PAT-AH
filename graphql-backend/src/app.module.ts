import { Module } from '@nestjs/common';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestModule } from './rest/rest.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    // GraphQL temporarily disabled to simplify startup; REST compatibility layer remains available
    AuthModule,
    UsersModule,
    // Rest compatibility module
    RestModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
