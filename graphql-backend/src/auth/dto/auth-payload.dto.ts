import { ObjectType, Field } from '@nestjs/graphql';
import { UserDto } from '../../users/dto/user.dto';

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => UserDto)
  user: UserDto;
}
