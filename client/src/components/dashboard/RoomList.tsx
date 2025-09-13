'use client';
import React, { useState, useEffect } from 'react';
import { useRooms, useJoinRoom, useDeleteRoom } from '../../hooks/useGraphQL';
import { useAuthContext } from '../../providers/AuthProvider';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Room } from '../../types/room';
import { useSubscription, useApolloClient } from '@apollo/client';
import { useNavigation } from '../../providers/NavigationProvider';
import { ROOM_CREATED_SUBSCRIPTION, ROOM_DELETED_SUBSCRIPTION, ROOM_UPDATED_GLOBAL_SUBSCRIPTION } from '../../graphql/subscriptions/rooms';
import { GET_ROOMS } from '../../graphql/queries/rooms';

export const RoomList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isJoiningNewRoom, setIsJoiningNewRoom] = useState(false);
  
  const { rooms: allRooms, loading, error, refetch } = useRooms();

  // Filter out rooms with 0 members (should be auto-deleted)
  const rooms = allRooms?.filter((room: Room) => room.members.length > 0) || [];

  // Debug log
  useEffect(() => {
    console.log('Rooms data:', {
      allRooms: allRooms?.length,
      filteredRooms: rooms.length,
      roomsWithZeroMembers: allRooms?.filter((room: Room) => room.members.length === 0).length
    });
  }, [allRooms, rooms]);
  const { joinRoom } = useJoinRoom();
  const { deleteRoom, loading: deleteLoading } = useDeleteRoom();
  const { user } = useAuthContext();
  const { navigateToRoom, currentView } = useNavigation();
  const apolloClient = useApolloClient();

  // Subscribe to new room creation
  const { data: newRoomData, loading: subLoading, error: subError } = useSubscription(ROOM_CREATED_SUBSCRIPTION);

  // Subscribe to room deletion
  const { data: deletedRoomData } = useSubscription(ROOM_DELETED_SUBSCRIPTION);

  // Subscribe to room updates (member count changes, etc.)
  const { data: updatedRoomData } = useSubscription(ROOM_UPDATED_GLOBAL_SUBSCRIPTION);

  // Debug subscription
  useEffect(() => {
    console.log('Room subscriptions state:', {
      roomCreated: { loading: subLoading, error: subError, data: newRoomData },
      roomDeleted: { data: deletedRoomData },
      roomUpdated: { data: updatedRoomData }
    });
  }, [subLoading, subError, newRoomData, deletedRoomData, updatedRoomData]);

  // Add new room to cache when subscription receives data
  useEffect(() => {
    if (newRoomData?.roomCreated) {
      console.log('New room created via subscription:', newRoomData.roomCreated);

      // Check if this room is not created by current user (to avoid duplicate)
      if (newRoomData.roomCreated.creatorId !== user?.id) {
        refetch(); // Only refetch if it's from another user
      }
    }
  }, [newRoomData, refetch, user?.id]);

  // Handle room deletion
  useEffect(() => {
    if (deletedRoomData?.roomDeleted) {
      console.log('Room deleted via subscription:', deletedRoomData.roomDeleted);

      // Update cache directly to remove deleted room immediately
      const cache = apolloClient.cache;
      try {
        const existingRooms = cache.readQuery({ query: GET_ROOMS }) as any;
        if (existingRooms?.rooms) {
          cache.writeQuery({
            query: GET_ROOMS,
            data: {
              rooms: existingRooms.rooms.filter((room: any) => room.id !== deletedRoomData.roomDeleted.id)
            }
          });
        }
      } catch (error) {
        console.error('Error updating cache after room deletion:', error);
        // Fallback to refetch if cache update fails
        refetch();
      }
    }
  }, [deletedRoomData, refetch]);

  // Handle room updates (member count changes, etc.)
  useEffect(() => {
    if (updatedRoomData?.roomUpdatedGlobal) {
      console.log('Room updated via subscription:', updatedRoomData.roomUpdatedGlobal);

      // Update cache directly to reflect room changes immediately
      const cache = apolloClient.cache;
      try {
        const existingRooms = cache.readQuery({ query: GET_ROOMS }) as any;
        if (existingRooms?.rooms) {
          const updatedRoom = updatedRoomData.roomUpdatedGlobal;
          const updatedRooms = existingRooms.rooms.map((room: any) =>
            room.id === updatedRoom.id ? updatedRoom : room
          );

          cache.writeQuery({
            query: GET_ROOMS,
            data: {
              rooms: updatedRooms
            }
          });
        }
      } catch (error) {
        console.error('Error updating cache after room update:', error);
        // Fallback to refetch if cache update fails
        refetch();
      }
    }
  }, [updatedRoomData, refetch, apolloClient.cache]);

  // Refetch when returning to dashboard view
  useEffect(() => {
    if (currentView === 'dashboard') {
      console.log('Returned to dashboard, refreshing room list...');
      refetch();
    }
  }, [currentView, refetch]);

  // Auto-refetch fallback removed - relying on GraphQL subscriptions for real-time updates
  // If you experience sync issues, you can re-enable the interval above

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ variables: { roomId } });
      navigateToRoom(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsCreateModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await deleteRoom({
          variables: { roomId }
        });
        // Refetch rooms after successful deletion
        refetch();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Có lỗi xảy ra khi xóa phòng. Vui lòng thử lại.');
      }
    }
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingRoom(null);
    refetch();
  };

  const handleRoomCreated = async (room: Room) => {
    // Auto-join the newly created room
    setIsJoiningNewRoom(true);
    try {
      await joinRoom({ variables: { roomId: room.id } });
      navigateToRoom(room.id);
    } catch (error) {
      console.error('Error joining newly created room:', error);
      // If auto-join fails, just refresh the room list
      refetch();
      setIsJoiningNewRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải danh sách phòng</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading overlay when joining new room */}
      {isJoiningNewRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-700">Đang tham gia phòng...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách phòng</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => refetch()}>
            🔄 Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Tạo phòng mới
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có phòng nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo phòng mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room: Room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={handleJoinRoom}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
              isOwner={room.creatorId === user?.id}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        editingRoom={editingRoom}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
};