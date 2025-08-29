import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../types/message.type';

@InputType()
export class CreateMessageInput {
  @Field()
  @IsString()
  content: string;

  @Field(() => MessageType, { defaultValue: MessageType.TEXT })
  @IsEnum(MessageType)
  type: MessageType;

  @Field()
  @IsString()
  roomId: string;
}