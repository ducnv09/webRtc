'use client';
import React, { useState } from 'react';
import { useRooms, useJoinRoom } from '../../hooks/useGraphQL';
import { useAuthContext } from '../../providers/AuthProvider';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Room } from '../../types/room';
import { useRouter } from 'next/navigation';

export const RoomList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const { rooms, loading, error, refetch } = useRooms();
  const { joinRoom } = useJoinRoom();
  const { user } = useAuthContext();
  const router = useRouter();

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ variables: { roomId } });
      router.push(`/room/${roomId}`);
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
      // Implement delete room mutation
      console.log('Delete room:', roomId);
    }
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingRoom(null);
    refetch();
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách phòng</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Tạo phòng mới
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có phòng nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo phòng mới.</p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Tạo phòng đầu tiên
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={handleJoinRoom}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
              isOwner={room.creatorId === user?.id}
            />
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        editingRoom={editingRoom}
      />
    </div>
  );
};