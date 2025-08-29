import { ObjectType, Field } from '@nestjs/graphql';
import { Room } from '../types/room.type';
import { User } from '../types/user.type';

@ObjectType()
export class RoomWithMembersResponse {
  @Field(() => Room)
  room: Room;

  @Field(() => [User])
  activeMembers: User[];
}

@ObjectType()
export class JoinRoomResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Room, { nullable: true })
  room?: Room;
}