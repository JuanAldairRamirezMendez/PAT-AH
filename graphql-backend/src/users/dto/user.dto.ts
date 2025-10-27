import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  nombre?: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  telefono: string;

  @Field({ nullable: true })
  ciudad?: string;
}
