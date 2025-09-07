import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION } from '../graphql/mutations/auth';
import { ME_QUERY } from '../graphql/queries/auth';
import { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check for token on client side
  useEffect(() => {
    console.log('useEffect running, window:', typeof window);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('Token check:', { token: !!token });

      if (!token) {
        console.log('No token, setting loading to false');
        setLoading(false);
      }
      setInitialized(true);
    }
  }, []);

  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    skip: typeof window === 'undefined' || !localStorage.getItem('accessToken'),
  });

  // Handle query results with useEffect instead of onCompleted/onError
  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
      setLoading(false);
    }
  }, [meData]);

  useEffect(() => {
    if (meError) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      setUser(null);
      setLoading(false);
    }
  }, [meError]);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.login.accessToken);
      }
      setUser(data.login.user);
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, avatar?: string) => {
    try {
      const { data } = await registerMutation({
        variables: { input: { username, email, password, avatar } }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.register.accessToken);
      }
      setUser(data.register.user);
      setLoading(false);
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      setUser(null);
      setLoading(false);
    }
  };

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
  const finalLoading = hasToken ? (loading || meLoading) : loading;
  console.log('Auth state:', { user: !!user, loading: finalLoading, hasToken, meLoading, internalLoading: loading, initialized });

  return {
    user,
    login,
    register,
    logout,
    loading: finalLoading,
  };
};