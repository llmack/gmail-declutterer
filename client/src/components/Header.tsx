import React from 'react';
import { Link } from 'wouter';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import gmailDecluttererLogo from '@/assets/gmail-declutterer-logo.svg';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useGoogleAuth();

  return (
    <header className="bg-[#a6d0e4] shadow-sm border-b border-neutral-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="h-10 w-10 cursor-pointer">
              <img 
                src={gmailDecluttererLogo} 
                alt="Gmail Declutterer Logo" 
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-xl font-medium text-gray-800">Gmail Declutterer</h1>
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
