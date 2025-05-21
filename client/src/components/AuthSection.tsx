import React, { useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import FeatherIcon from '@/assets/FeatherIcon';
import PermissionsModal from './PermissionsModal';

const AuthSection: React.FC = () => {
  const { login, isLoading } = useGoogleAuth();
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const handleSignIn = () => {
    setShowPermissionsModal(true);
  };

  const handleConfirmPermissions = () => {
    setShowPermissionsModal(false);
    login();
  };

  return (
    <div className="py-8">
      <Card className="max-w-md mx-auto overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-64 h-48 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <FeatherIcon className="w-40 h-40" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-4 text-center">
            Welcome to Gmail Declutter
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Intelligently clean up your Gmail inbox with powerful, rule-based decluttering tools.
          </p>

          <div className="flex justify-center">
            <Button 
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors duration-200 shadow-sm rounded-md"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              <img
                src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-900">
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 block">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Permissions Required:</h3>
          <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
            <li className="flex items-start">
              <svg 
                className="w-4 h-4 text-[#4285F4] mr-2 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Read Gmail messages and metadata (to analyze your inbox)</span>
            </li>
            <li className="flex items-start">
              <svg 
                className="w-4 h-4 text-[#4285F4] mr-2 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Modify Gmail messages (to move emails to trash when requested)</span>
            </li>
          </ul>
          <p className="text-xs text-gray-600">
            We prioritize your privacy. Your email content is only processed locally and never stored on our servers.
          </p>
        </CardFooter>
      </Card>

      <PermissionsModal 
        isOpen={showPermissionsModal} 
        onClose={() => setShowPermissionsModal(false)}
        onConfirm={handleConfirmPermissions}
      />
    </div>
  );
};

export default AuthSection;
