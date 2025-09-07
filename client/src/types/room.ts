import { User } from "./auth";
import { Message } from "./message";
import { RoomMember } from "./user";

export interface Room {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: User;
  members: RoomMember[];
  messages: Message[];
}

export interface CreateRoomInput {
  name: string;
  description?: string;
  maxMembers: number;
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
  maxMembers?: number;
  isActive?: boolean;
}