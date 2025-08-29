import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.type';
import { Room } from './room.type';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

registerEnumType(MessageType, {
  name: 'MessageType',
});

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => MessageType)
  type: MessageType;

  @Field()
  createdAt: Date;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  roomId: string;

  @Field(() => User)
  user: User;

  @Field(() => Room)
  room: Room;
}