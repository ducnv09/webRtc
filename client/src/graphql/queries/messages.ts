import { gql } from '@apollo/client';

export const GET_ROOM_MESSAGES = gql`
  query GetRoomMessages($roomId: String!, $limit: Int, $offset: Int) {
    roomMessages(roomId: $roomId, limit: $limit, offset: $offset) {
      id
      content
      type
      createdAt
      user {
        id
        username
        avatar
      }
    }
  }
`;