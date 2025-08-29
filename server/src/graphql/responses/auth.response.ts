import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../types/user.type';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}