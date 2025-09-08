import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../types/user.type';
import { Room } from '../types/room.type';
import { Message } from '../types/message.type';

@ObjectType()
export class UserJoinedRoomEvent {
  @Field(() => String)
  roomId: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class UserLeftRoomEvent {
  @Field(() => String)
  roomId: string;

  @Field(() => String)
  userId: string;
}

@ObjectType()
export class MessageSentEvent {
  @Field(() => String)
  roomId: string;

  @Field(() => Message)
  message: Message;
}

@ObjectType()
export class RoomUpdatedEvent {
  @Field(() => Room)
  room: Room;
}

@ObjectType()
export class RoomDeletedEvent {
  @Field(() => String)
  id: string;
}