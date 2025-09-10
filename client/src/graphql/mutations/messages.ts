import { gql } from '@apollo/client';

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: CreateMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      type
      userId
      createdAt
      user {
        id
        username
        avatar
      }
    }
  }
`;

export const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($messageId: String!) {
    deleteMessage(messageId: $messageId)
  }
`;