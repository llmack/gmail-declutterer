import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, AuthState } from '@/lib/types';

export function useGoogleAuth() {
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fetch authentication URL
  const { data: authUrlData } = useQuery({
    queryKey: ['/api/auth/url'],
    enabled: false,
  });

  // Check current authentication status
  const { 
    data: authData, 
    isLoading: authLoading,
    error: authError,
    refetch: refetchAuth
  } = useQuery<AuthState>({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Also invalidate any Gmail data queries
      queryClient.invalidateQueries({ queryKey: ['/api/gmail'] });
    },
  });

  // Initiate Google OAuth login
  const login = async () => {
    try {
      const authUrlResponse = await queryClient.fetchQuery({
        queryKey: ['/api/auth/url'],
      });
      
      if (authUrlResponse.url) {
        setIsRedirecting(true);
        window.location.href = authUrlResponse.url;
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    isAuthenticated: authData?.authenticated || false,
    user: authData?.user || null,
    login,
    logout,
    isLoading: authLoading || isRedirecting || logoutMutation.isPending,
    error: authError ? (authError as Error).message : null,
    refetchAuth,
  };
}
