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
  RoomUpdatedEvent,
  RoomDeletedEvent
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
    const room = await this.roomService.create(input, user.id);
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
    const result = await this.roomService.joinRoom(roomId, user.id);

    if (result) {
      // Publish user joined event with correct user data
      pubSub.publish('userJoinedRoom', {
        userJoinedRoom: { roomId, user: user }
      });

      // Also publish room update to refresh member count
      const updatedRoom = await this.roomService.findById(roomId);
      pubSub.publish('roomUpdated', { roomUpdated: updatedRoom });
      pubSub.publish('roomUpdatedGlobal', { roomUpdatedGlobal: updatedRoom });
    }

    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async leaveRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.roomService.leaveRoom(roomId, user.id);

    if (result) {
      pubSub.publish('userLeftRoom', {
        userLeftRoom: { roomId, userId: user.id }
      });

      // Check if room still exists and publish room update to refresh member count
      try {
        const updatedRoom = await this.roomService.findById(roomId);
        if (updatedRoom && updatedRoom.isActive) {
          pubSub.publish('roomUpdated', { roomUpdated: updatedRoom });
          pubSub.publish('roomUpdatedGlobal', { roomUpdatedGlobal: updatedRoom });
        }
      } catch (error) {
        // Room might have been deleted, ignore error
        console.log('Room not found after user left, likely deleted');
      }
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
    const room = await this.roomService.updateRoom(roomId, user.id, input);
    pubSub.publish('roomUpdated', { roomUpdated: room });
    return room;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.roomService.deleteRoom(roomId, user.id);

    if (result) {
      pubSub.publish('roomDeleted', { roomDeleted: { id: roomId } });
    }

    return result;
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

  @Subscription(() => Room)
  roomUpdatedGlobal() {
    return pubSub.asyncIterator('roomUpdatedGlobal');
  }

  @Subscription(() => RoomDeletedEvent)
  roomDeleted() {
    return pubSub.asyncIterator('roomDeleted');
  }
}