import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => String)
  async helloUsers() {
    const users = await this.usersService.findAll();
    return `Users: ${users.length}`;
  }
}
