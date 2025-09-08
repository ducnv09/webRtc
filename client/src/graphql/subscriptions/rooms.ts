import { gql } from '@apollo/client';

export const ROOM_CREATED_SUBSCRIPTION = gql`
  subscription RoomCreated {
    roomCreated {
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

export const ROOM_UPDATED_SUBSCRIPTION = gql`
  subscription RoomUpdated($roomId: String!) {
    roomUpdated(roomId: $roomId) {
      room {
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
  }
`;

export const USER_JOINED_ROOM_SUBSCRIPTION = gql`
  subscription UserJoinedRoom($roomId: String!) {
    userJoinedRoom(roomId: $roomId) {
      roomId
      user {
        id
        username
        avatar
        isOnline
      }
    }
  }
`;

export const USER_LEFT_ROOM_SUBSCRIPTION = gql`
  subscription UserLeftRoom($roomId: String!) {
    userLeftRoom(roomId: $roomId) {
      roomId
      userId
    }
  }
`;

export const ROOM_DELETED_SUBSCRIPTION = gql`
  subscription RoomDeleted {
    roomDeleted {
      id
    }
  }
`;

export const ROOM_UPDATED_GLOBAL_SUBSCRIPTION = gql`
  subscription RoomUpdatedGlobal {
    roomUpdatedGlobal {
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
