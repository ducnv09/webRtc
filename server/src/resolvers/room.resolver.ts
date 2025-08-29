import { Resolver, Mutation, Query, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { RoomService } from '../services/room.service';
import { CreateRoomInput, UpdateRoomInput } from '../graphql/inputs/room.input';
import { Room } from '../graphql/types/room.type';
import { User } from '../graphql/types/user.type';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { 
  UserJoinedRoomEvent, 
  UserLeftRoomEvent, 
  RoomUpdatedEvent 
} from '../graphql/subscriptions/room.subscription';

const pubSub = new PubSub();

@Resolver(() => Room) 
export class RoomResolver {
    constructor(private roomService: RoomService) {}

    @Mutation(() => Room)
    @UseGuards(JwtAuthGuard)
    async createRoom(
        @Args('input') input: CreateRoomInput,
        @CurrentUser() user: any,
    ): Promise<Room> {
        const room = await this.roomService.create(input, user.userId);
        pubSub.publish('roomCreated', { roomCreated: room });
        return room;
    }
}