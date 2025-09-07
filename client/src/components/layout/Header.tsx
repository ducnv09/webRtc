'use client';
import React from 'react';
import { useAuthContext } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuthContext();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              WebRTC Video Call
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-3">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  Đăng xuất
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};