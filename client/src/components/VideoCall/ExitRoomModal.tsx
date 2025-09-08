'use client';
import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ExitRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJustLeave: () => void;
  onEndForEveryone: () => void;
  loading?: boolean;
}

export const ExitRoomModal: React.FC<ExitRoomModalProps> = ({
  isOpen,
  onClose,
  onJustLeave,
  onEndForEveryone,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kết thúc cuộc gọi hay chỉ rời đi?"
      className="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Bạn có thể chỉ rời khỏi cuộc gọi nếu không muốn kết thúc nó cho tất cả mọi người khác
        </p>

        <div className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={onJustLeave}
            variant="secondary"
            disabled={loading}
            className="w-full justify-center"
          >
            Chỉ rời khỏi cuộc gọi
          </Button>
          
          <Button
            onClick={onEndForEveryone}
            variant="danger"
            disabled={loading}
            loading={loading}
            className="w-full justify-center"
          >
            Kết thúc cuộc gọi cho tất cả
          </Button>
        </div>
      </div>
    </Modal>
  );
};
