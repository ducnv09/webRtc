import { gql } from '@apollo/client';

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      description
      isActive
      maxMembers
      createdAt
      updatedAt
      creatorId
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
          isOnline
        }
      }
    }
  }
`;

export const GET_ROOM = gql`
  query GetRoom($id: String!) {
    room(id: $id) {
      id
      name
      description
      isActive
      maxMembers
      createdAt
      updatedAt
      creatorId
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
          isOnline
        }
        joinedAt
      }
      messages {
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
  }
`;