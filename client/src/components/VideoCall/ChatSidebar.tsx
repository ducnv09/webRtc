'use client';
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useRoomMessages, useSendMessage } from '../../hooks/useGraphQL';
import { useSocket } from '../../hooks/useSocket';
import { useAuthContext } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';
import { formatTime } from '../../lib/utils';
import { Message, MessageType } from '../../types/message';

interface ChatSidebarProps {
  roomId: string;
  onClose: () => void;
}

const ChatSidebarComponent: React.FC<ChatSidebarProps> = ({ roomId, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthContext();
  const { socket } = useSocket('chat');
  const { messages: initialMessages, loading } = useRoomMessages(roomId);
  const { sendMessage } = useSendMessage();

  // Sử dụng useMemo để tránh tạo mảng mới không cần thiết
  const reversedInitialMessages = useMemo(() => {
    if (!initialMessages || initialMessages.length === 0) return [];
    return [...initialMessages].reverse();
  }, [initialMessages]);

  // Reset messages when roomId changes
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  // Sync messages with initial messages from GraphQL (chỉ khi component mount lần đầu)
  useEffect(() => {
    if (reversedInitialMessages.length > 0 && messages.length === 0) {
      setMessages(reversedInitialMessages);
    }
  }, [reversedInitialMessages, messages.length]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-chat-room', { roomId });

      socket.on('new-chat-message', (message: Message) => {
        setMessages(prev => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh duplicate
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
      });

      socket.on('joined-chat-room', () => {
        // Room joined successfully - không cần log để tránh re-render
      });

      return () => {
        socket.off('new-chat-message');
        socket.off('joined-chat-room');
      };
    }

    return () => {}; // Return empty cleanup function if no socket
  }, [socket, roomId]);

  useEffect(() => {
    // Chỉ scroll khi có tin nhắn mới, tránh scroll khi load initial messages
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages.length]); // Chỉ trigger khi số lượng tin nhắn thay đổi

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const result = await sendMessage({
        variables: {
          input: {
            content: newMessage.trim(),
            type: MessageType.TEXT,
            roomId,
          },
        },
      });

      // Thêm tin nhắn vào state ngay lập tức để cập nhật UI
      if (result.data?.sendMessage) {
        setMessages(prev => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh duplicate
          const exists = prev.some(msg => msg.id === result.data.sendMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, result.data.sendMessage];
        });
      }

      setNewMessage('');

      // Scroll sẽ được handle tự động bởi useEffect khi messages.length thay đổi
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
        ) : !user ? (
          <div className="text-center text-gray-500">Đang tải thông tin người dùng...</div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                {!isCurrentUser && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.user.username}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
            );
          })
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

// Sử dụng memo để tránh re-render không cần thiết
export const ChatSidebar = memo(ChatSidebarComponent);