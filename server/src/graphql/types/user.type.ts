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

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  isOnline: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Room])
  createdRooms: Room[];

  @Field(() => [RoomMember])
  roomMembers: RoomMember[];

  @Field(() => [Message])
  messages: Message[];
}