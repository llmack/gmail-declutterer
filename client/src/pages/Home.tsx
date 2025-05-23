import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import AuthSection from '@/components/AuthSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';

const Home: React.FC = () => {
  const { isAuthenticated, isLoading } = useGoogleAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {isLoading ? (
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
