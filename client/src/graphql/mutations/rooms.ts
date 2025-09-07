import { gql } from '@apollo/client';

export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      name
      description
      maxMembers
      createdAt
      creator {
        id
        username
        avatar
      }
    }
  }
`;

export const JOIN_ROOM_MUTATION = gql`
  mutation JoinRoom($roomId: String!) {
    joinRoom(roomId: $roomId)
  }
`;

export const LEAVE_ROOM_MUTATION = gql`
  mutation LeaveRoom($roomId: String!) {
    leaveRoom(roomId: $roomId)
  }
`;

export const UPDATE_ROOM_MUTATION = gql`
  mutation UpdateRoom($roomId: String!, $input: UpdateRoomInput!) {
    updateRoom(roomId: $roomId, input: $input) {
      id
      name
      description
      maxMembers
      createdAt
      updatedAt
      creator {
        id
        username
        avatar
      }
      members {
        id
        user {
          id
          username
          avatar
        }
      }
    }
  }
`;

export const DELETE_ROOM_MUTATION = gql`
  mutation DeleteRoom($roomId: String!) {
    deleteRoom(roomId: $roomId)
  }
`;