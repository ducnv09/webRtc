import { gql } from '@apollo/client';

export const GET_ROOM_MESSAGES = gql`
  query GetRoomMessages($roomId: String!, $limit: Float, $offset: Float) {
    roomMessages(roomId: $roomId, limit: $limit, offset: $offset) {
      id
      content
      type
      createdAt
      userId
      user {
        id
        username
        avatar
      }
    }
  }
`;