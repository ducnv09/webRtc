import React from 'react';
import { RoomMember } from '../../types/user';

interface ParticipantsListProps {
  participants: RoomMember[];
  onClose: () => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Thành viên ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {participants.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              {member.user.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {member.user.username}
                </p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    member.user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <p className="text-xs text-gray-500">
                    {member.user.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};