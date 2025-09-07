'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRoomMessages, useSendMessage } from '../../hooks/useGraphQL';
import { useSocket } from '../../hooks/useSocket';
import { useAuthContext } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatTime } from '../../lib/utils';
import { Message, MessageType } from '../../types/message';

interface ChatSidebarProps {
  roomId: string;
  onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ roomId, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthContext();
  const { socket } = useSocket('chat');
  const { messages: initialMessages, loading } = useRoomMessages(roomId);
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.slice().reverse());
    }
  }, [initialMessages]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-chat-room', { roomId });

      socket.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        variables: {
          input: {
            content: newMessage.trim(),
            type: MessageType.TEXT,
            roomId,
          },
        },
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.userId !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.user.username}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            size="sm"
          >
            Gửi
          </Button>
        </form>
      </div>
    </div>
  );
};