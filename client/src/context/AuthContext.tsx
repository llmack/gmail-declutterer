import React, { createContext, useState, useEffect } from 'react';
import { UserInfo } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  loading: boolean;
}

const defaultUserInfo: UserInfo = {
  id: 0,
  email: '',
  name: null,
  isAuthenticated: false,
};

export const AuthContext = createContext<AuthContextType>({
  userInfo: defaultUserInfo,
  setUserInfo: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/user');
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setUserInfo({
            id: data.id,
            email: data.email,
            name: data.name,
            isAuthenticated: true,
          });
        } else {
          setUserInfo(defaultUserInfo);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo(defaultUserInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
