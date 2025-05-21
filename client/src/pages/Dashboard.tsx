import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useGmailProfile, useTemporaryCodeEmails, useTrashEmails, calculateEmailStats } from '@/hooks/useGmailAPI';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import StatsCard from '@/components/StatsCard';
import EmailCategoryCard from '@/components/EmailCategoryCard';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useGoogleAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { 
    data: profile, 
    isLoading: profileLoading,
  } = useGmailProfile();
  
  const { 
    data: tempCodeEmails,
    isLoading: tempCodesLoading,
  } = useTemporaryCodeEmails();
  
  const trashEmailsMutation = useTrashEmails();

  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Simulate loading state for demonstration purposes
  useEffect(() => {
    if (!profileLoading && !tempCodesLoading) {
      const timer = setTimeout(() => {
        setDashboardLoaded(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [profileLoading, tempCodesLoading]);

  const isLoading = authLoading || profileLoading || tempCodesLoading || !dashboardLoaded;

  const handleCleanup = async (emailIds: string[]) => {
    try {
      await trashEmailsMutation.mutateAsync(emailIds);
      
      toast({
        title: 'Success!',
        description: `${emailIds.length} emails have been moved to trash.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move emails to trash. Please try again.',
        variant: 'destructive',
      });
      console.error('Trash emails error:', error);
    }
  };

  const stats = calculateEmailStats(profile, tempCodeEmails);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {isLoading ? (
            <LoadingState />
          ) : (
            <div>
              {/* Overview Section */}
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2">Inbox Overview</h2>
                <p className="text-gray-600 mb-6">
                  We've analyzed your inbox to find decluttering opportunities.
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Total Emails Card */}
                  <StatsCard
                    title="Total Emails"
                    value={stats.totalEmails.toLocaleString()}
                    icon={
                      <svg 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  
                  {/* Storage Used Card */}
                  <StatsCard
                    title="Storage Used"
                    value={stats.storageUsed}
                    icon={
                      <svg 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    }
                  />
                  
                  {/* Declutter Potential Card */}
                  <StatsCard
                    title="Declutter Potential"
                    value={`${stats.declutterPotential}%`}
                    icon={
                      <svg 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    }
                    color="text-[#34A853]"
                  />
                </div>
              </div>
              
              {/* Email Categories Section */}
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Email Categories</h2>
                
                {/* Email Categories Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Temporary Codes Card */}
                  <EmailCategoryCard
                    icon={
                      <svg 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    }
                    title="Temporary Codes"
                    description="Verification codes, OTPs, and temporary login links that are no longer needed."
                    emails={tempCodeEmails || []}
                    onCleanup={handleCleanup}
                    isLoading={trashEmailsMutation.isPending}
                  />
                </div>
              </div>
              
              {/* Future Categories Message */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  <svg 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4 text-gray-400 inline-block mr-1 mb-0.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  More categories like Promotions, Subscriptions, and News will be available in the next update.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
