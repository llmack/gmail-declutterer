import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import AuthSection from '@/components/AuthSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
