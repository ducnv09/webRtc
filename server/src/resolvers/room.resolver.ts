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

  @Query(() => [Room])
  @UseGuards(JwtAuthGuard)
  async rooms(): Promise<Room[]> {
    return this.roomService.findAll();
  }

  @Query(() => Room)
  @UseGuards(JwtAuthGuard)
  async room(@Args('id') id: string): Promise<Room> {
    return this.roomService.findById(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.roomService.joinRoom(roomId, user.userId);
    
    if (result) {
      const userInfo = await this.roomService.findById(roomId);
      pubSub.publish('userJoinedRoom', { 
        userJoinedRoom: { roomId, user: userInfo } 
      });
    }
    
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async leaveRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.roomService.leaveRoom(roomId, user.userId);
    
    if (result) {
      pubSub.publish('userLeftRoom', { 
        userLeftRoom: { roomId, userId: user.userId } 
      });
    }
    
    return result;
  }

  @Mutation(() => Room)
  @UseGuards(JwtAuthGuard)
  async updateRoom(
    @Args('roomId') roomId: string,
    @Args('input') input: UpdateRoomInput,
    @CurrentUser() user: any,
  ): Promise<Room> {
    const room = await this.roomService.updateRoom(roomId, user.userId, input);
    pubSub.publish('roomUpdated', { roomUpdated: room });
    return room;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.roomService.deleteRoom(roomId, user.userId);
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async roomMembers(@Args('roomId') roomId: string): Promise<User[]> {
    return this.roomService.getRoomMembers(roomId);
  }

  // Subscriptions
  @Subscription(() => Room)
  roomCreated() {
    return pubSub.asyncIterator('roomCreated');
  }

  @Subscription(() => UserJoinedRoomEvent)
  userJoinedRoom(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator('userJoinedRoom');
  }

  @Subscription(() => UserLeftRoomEvent)
  userLeftRoom(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator('userLeftRoom');
  }

  @Subscription(() => RoomUpdatedEvent)
  roomUpdated(@Args('roomId') roomId: string) {
    return pubSub.asyncIterator('roomUpdated');
  }
}