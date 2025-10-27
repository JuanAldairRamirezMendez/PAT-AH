import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  telefono: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  nombre?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  ciudad?: string;
}
