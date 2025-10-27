import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.dto';
import { RegisterInput } from './dto/register.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload, { name: 'register' })
  async register(@Args('input') input: RegisterInput) {
    const res = await this.authService.register(input);
    return res;
  }

  @Mutation(() => AuthPayload, { name: 'login' })
  async login(@Args('phone') phone: string, @Args('password') password: string) {
    const res = await this.authService.login(phone, password);
    return res;
  }
}
