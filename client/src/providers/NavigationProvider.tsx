'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  currentView: 'dashboard' | 'room';
  currentRoomId: string | null;
  navigateToDashboard: () => void;
  navigateToRoom: (roomId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'room'>('dashboard');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Sync with URL changes
  useEffect(() => {
    if (pathname === '/dashboard') {
      setCurrentView('dashboard');
      setCurrentRoomId(null);
    } else if (pathname.startsWith('/room/')) {
      const roomId = pathname.split('/room/')[1];
      setCurrentView('room');
      setCurrentRoomId(roomId);
    }
  }, [pathname]);

  const navigateToDashboard = () => {
    console.log('NavigationProvider: navigating to dashboard');
    setCurrentView('dashboard');
    setCurrentRoomId(null);
    // Use replace to avoid adding to history stack and prevent full page reload
    router.replace('/dashboard');
  };

  const navigateToRoom = (roomId: string) => {
    console.log('NavigationProvider: navigating to room', roomId);
    setCurrentView('room');
    setCurrentRoomId(roomId);
    // Use replace to avoid adding to history stack and prevent full page reload
    router.replace(`/room/${roomId}`);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        currentRoomId,
        navigateToDashboard,
        navigateToRoom,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
