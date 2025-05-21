import React from 'react';
import { Link } from 'wouter';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useGoogleAuth();

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="w-8 h-8 bg-[#4285F4] rounded-full flex items-center justify-center cursor-pointer">
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M3 6l9 6 9-6M3 12l9 6 9-6M3 18l9 6 9-6" />
              </svg>
            </div>
          </Link>
          <h1 className="text-lg font-medium text-gray-900">Gmail Declutter</h1>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && !isLoading ? (
            <>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
              >
                Sign out
              </Button>
              <Avatar className="w-8 h-8">
                {user?.picture ? (
                  <AvatarImage src={user.picture} alt={user.name || user.email} />
                ) : null}
                <AvatarFallback>{getInitials(user?.name || user?.email || '')}</AvatarFallback>
              </Avatar>
            </>
          ) : null}
        </div>
        <button className="md:hidden text-gray-900">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
