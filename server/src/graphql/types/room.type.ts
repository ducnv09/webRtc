import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.type';
import { Message } from './message.type';
import { RoomMember } from './room-member.type';

@ObjectType()
export class Room {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  isActive: boolean;

  @Field()
  maxMembers: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String)
  creatorId: string;

  @Field(() => User)
  creator: User;

  @Field(() => [RoomMember])
  members: RoomMember[];

  @Field(() => [Message], { nullable: true })
  messages?: Message[];
}