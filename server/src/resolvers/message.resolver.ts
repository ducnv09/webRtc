import { Resolver, Mutation, Query, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { MessageService } from '../services/message.service';
import { CreateMessageInput } from '../graphql/inputs/message.input';
import { Message } from '../graphql/types/message.type';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessageSentEvent } from '../graphql/subscriptions/room.subscription';

const pubSub = new PubSub();

@Resolver(() => Message)
export class MessageResolver {
  constructor(private messageService: MessageService) {}

  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Args('input') input: CreateMessageInput,
    @CurrentUser() user: any,
  ): Promise<Message> {
    const message = await this.messageService.createMessage(input, user.id);
    pubSub.publish('messageSent', {
      messageSent: { roomId: input.roomId, message }
    });
    return message;
  }

  @Query(() => [Message])
  @UseGuards(JwtAuthGuard)
  async roomMessages(
    @Args('roomId') roomId: string,
    @Args('limit', { defaultValue: 50 }) limit: number,
    @Args('offset', { defaultValue: 0 }) offset: number,
    @CurrentUser() user: any,
  ): Promise<Message[]> {
    return this.messageService.getRoomMessages(roomId, user.id, limit, offset);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMessage(
    @Args('messageId') messageId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.messageService.deleteMessage(messageId, user.id);
  }

  @Subscription(() => MessageSentEvent)
  messageSent(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator('messageSent');
  }
}