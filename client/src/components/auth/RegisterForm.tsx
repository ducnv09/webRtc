'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, avatar || undefined);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng ký tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            đăng nhập với tài khoản có sẵn
          </a>
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            label="Tên người dùng"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập tên người dùng"
          />
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email của bạn"
          />
          
          <Input
            label="Avatar URL (tùy chọn)"
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
          
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          />
          
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!username || !email || !password || !confirmPassword}
        >
          Đăng ký
        </Button>
      </form>
    </div>
  );
};