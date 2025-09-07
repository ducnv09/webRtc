import { Message } from "./message";
import { Room } from "./room";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  createdRooms: Room[];
  roomMembers: RoomMember[];
  messages: Message[];
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: User;
  room: Room;
}