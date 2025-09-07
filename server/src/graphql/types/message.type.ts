import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.type';
import { Room } from './room.type';
import { MessageType } from '@prisma/client';

// Export MessageType để các file khác có thể import
export { MessageType };

registerEnumType(MessageType, {
  name: 'MessageType',
});

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => MessageType) // enum dùng chung
  type: MessageType;

  @Field()
  createdAt: Date;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  roomId: string;

  @Field(() => User)
  user: User;

  @Field(() => Room, { nullable: true })
  room?: Partial<Room>;
}