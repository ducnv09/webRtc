import { useState, useEffect, useContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION } from '../graphql/mutations/auth';
import { ME_QUERY } from '../graphql/queries/auth';
import { User, LoginInput, RegisterInput } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('accessToken'),
    onCompleted: (data) => {
      setUser(data.me);
      setLoading(false);
    },
    onError: () => {
      localStorage.removeItem('accessToken');
      setLoading(false);
    }
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } }
      });
      
      localStorage.setItem('accessToken', data.login.accessToken);
      setUser(data.login.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, avatar?: string) => {
    try {
      const { data } = await registerMutation({
        variables: { input: { username, email, password, avatar } }
      });
      
      localStorage.setItem('accessToken', data.register.accessToken);
      setUser(data.register.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
    }
  }, []);

  return {
    user,
    login,
    register,
    logout,
    loading: loading || meLoading,
  };
};