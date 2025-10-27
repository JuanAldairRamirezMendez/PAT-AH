import { Module } from '@nestjs/common';
import { RestController } from './rest.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [RestController],
})
export class RestModule {}
