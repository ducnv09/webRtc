import { User } from "./auth";
import { Room } from "./room";

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  createdAt: string;
  userId: string;
  roomId: string;
  user: User;
  room: Room;
}

export interface CreateMessageInput {
  content: string;
  type: MessageType;
  roomId: string;
}