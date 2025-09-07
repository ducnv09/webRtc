'use client';
import React, { useState, useEffect } from 'react';
import { useCreateRoom, useUpdateRoom } from '../../hooks/useGraphQL';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Room } from '../../types/room';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoom?: Room | null;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  editingRoom,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [error, setError] = useState('');

  const { createRoom, loading: createLoading } = useCreateRoom();
  const { updateRoom, loading: updateLoading } = useUpdateRoom();

  const loading = createLoading || updateLoading;

  useEffect(() => {
    if (editingRoom) {
      setName(editingRoom.name);
      setDescription(editingRoom.description || '');
      setMaxMembers(editingRoom.maxMembers);
    } else {
      setName('');
      setDescription('');
      setMaxMembers(10);
    }
    setError('');
  }, [editingRoom, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Tên phòng không được để trống');
      return;
    }

    if (maxMembers < 2 || maxMembers > 50) {
      setError('Số thành viên tối đa phải từ 2 đến 50');
      return;
    }

    try {
      if (editingRoom) {
        // Update existing room
        await updateRoom({
          variables: {
            roomId: editingRoom.id,
            input: {
              name: name.trim(),
              description: description.trim() || undefined,
              maxMembers,
            },
          },
        });
      } else {
        // Create new room
        await createRoom({
          variables: {
            input: {
              name: name.trim(),
              description: description.trim() || undefined,
              maxMembers,
            },
          },
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (editingRoom ? 'Có lỗi xảy ra khi cập nhật phòng' : 'Có lỗi xảy ra khi tạo phòng'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRoom ? 'Chỉnh sửa phòng' : 'Tạo phòng mới'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Tên phòng"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên phòng"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả (tùy chọn)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả phòng"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Input
          label="Số thành viên tối đa"
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(parseInt(e.target.value))}
          min={2}
          max={50}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {editingRoom ? 'Cập nhật' : 'Tạo phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};