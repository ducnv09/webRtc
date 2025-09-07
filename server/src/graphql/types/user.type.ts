import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Room } from './room.type';
import { RoomMember } from './room-member.type';
import { Message } from './message.type';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field()
  isOnline: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Room], { nullable: true })
  createdRooms?: Room[];

  @Field(() => [RoomMember], { nullable: true })
  roomMembers?: RoomMember[];

  @Field(() => [Message], { nullable: true })
  messages?: Message[];
}