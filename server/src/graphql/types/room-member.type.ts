import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.type';
import { Room } from './room.type';

@ObjectType()
export class RoomMember {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  roomId: string;

  @Field()
  joinedAt: Date;

  @Field(() => User)
  user: User;

  @Field(() => Room)
  room: Room;
}