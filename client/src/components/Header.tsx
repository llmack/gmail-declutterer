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
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && !isLoading ? (
            <>
              <nav className="flex space-x-2 mr-4">
                <Link href="/dashboard" className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-[#8bbdd6] rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>
                <Link href="/history" className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-[#8bbdd6] rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                </Link>
              </nav>
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
