import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import AuthSection from '@/components/AuthSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import gmailDecluttererLogo from '@/assets/gmail-declutterer-logo.svg';

const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useGoogleAuth();
  const [, setLocation] = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  
  // Add a timeout to show the sign in form even if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000); // Show sign in form after 2 seconds even if still loading
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation('/dashboard');
    }
    
    // When loading completes, update the loading state
    if (!isLoading) {
      setShowLoading(false);
    }
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#a6d0e4] to-[#e6f7ff]">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-40 h-40 mb-6">
              <img 
                src={gmailDecluttererLogo} 
                alt="Gmail Declutterer Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Gmail Declutterer</h1>
            <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
              Clean up your inbox by intelligently organizing and removing unnecessary emails.
              Free up space and find what matters.
            </p>
          </div>
          
          {isLoading && showLoading ? (
            <LoadingState />
          ) : (
            <AuthSection />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
