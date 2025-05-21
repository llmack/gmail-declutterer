import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initiateLogin = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/google-url');
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Google OAuth URL
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error initiating login:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to connect to Google. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      auth.setUserInfo({
        id: 0,
        email: '',
        name: null,
        isAuthenticated: false,
      });
      
      // Clear all queries
      queryClient.clear();
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    userInfo: auth.userInfo,
    initiateLogin,
    logout,
    loading: auth.loading,
    isAuthenticated: auth.userInfo.isAuthenticated,
  };
};
