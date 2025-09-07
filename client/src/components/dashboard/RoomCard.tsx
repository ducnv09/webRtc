import React from 'react';
import { Room } from '../../types/room';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (roomId: string) => void;
  isOwner?: boolean;
  deleteLoading?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onJoin,
  onEdit,
  onDelete,
  isOwner = false,
  deleteLoading = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-gray-600 text-sm mb-3">
              {room.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isOwner && onEdit && (
            <button
              onClick={() => onEdit(room)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(room.id)}
              disabled={deleteLoading}
              className={`${
                deleteLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-400 hover:text-red-600'
              }`}
            >
              {deleteLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {room.members.length}/{room.maxMembers}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {room.creator.username}
          </span>
        </div>
        <span>{formatDate(room.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {room.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
        
        <Button
          onClick={() => onJoin(room.id)}
          disabled={!room.isActive || room.members.length >= room.maxMembers}
          size="sm"
        >
          Tham gia
        </Button>
      </div>
    </div>
  );
};