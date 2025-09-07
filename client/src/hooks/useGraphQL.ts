import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_ROOMS, GET_ROOM } from '../graphql/queries/rooms';
import { GET_ROOM_MESSAGES } from '../graphql/queries/messages';
import { CREATE_ROOM_MUTATION, JOIN_ROOM_MUTATION, LEAVE_ROOM_MUTATION } from '../graphql/mutations/rooms';
import { SEND_MESSAGE_MUTATION } from '../graphql/mutations/messages';

export const useRooms = () => {
  const { data, loading, error, refetch } = useQuery(GET_ROOMS);
  
  return {
    rooms: data?.rooms || [],
    loading,
    error,
    refetch,
  };
};

export const useRoom = (roomId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_ROOM, {
    variables: { id: roomId },
    skip: !roomId,
  });
  
  return {
    room: data?.room,
    loading,
    error,
    refetch,
  };
};

export const useRoomMessages = (roomId: string, limit = 50, offset = 0) => {
  const { data, loading, error, fetchMore } = useQuery(GET_ROOM_MESSAGES, {
    variables: { roomId, limit, offset },
    skip: !roomId,
  });
  
  return {
    messages: data?.roomMessages || [],
    loading,
    error,
    fetchMore,
  };
};

export const useCreateRoom = () => {
  const [createRoom, { loading, error }] = useMutation(CREATE_ROOM_MUTATION, {
    refetchQueries: [GET_ROOMS],
  });
  
  return { createRoom, loading, error };
};

export const useJoinRoom = () => {
  const [joinRoom, { loading, error }] = useMutation(JOIN_ROOM_MUTATION);
  
  return { joinRoom, loading, error };
};

export const useLeaveRoom = () => {
  const [leaveRoom, { loading, error }] = useMutation(LEAVE_ROOM_MUTATION);
  
  return { leaveRoom, loading, error };
};

export const useSendMessage = () => {
  const [sendMessage, { loading, error }] = useMutation(SEND_MESSAGE_MUTATION);
  
  return { sendMessage, loading, error };
};