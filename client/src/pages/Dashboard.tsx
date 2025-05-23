import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { 
  useGmailProfile, 
  useTemporaryCodeEmails, 
  useTrashEmails, 
  calculateEmailStats,
  useSubscriptionEmails,
  usePromotionalEmails,
  useNewsletterEmails,
  useRegularEmails
} from '@/hooks/useGmailAPI';
import { 
  TemporaryCodeEmail, 
  SubscriptionEmail, 
  PromotionalEmail, 
  NewsletterEmail, 
  RegularEmail 
} from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import StatsCard from '@/components/StatsCard';
import EmailCategoryCard from '@/components/EmailCategoryCard';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useGoogleAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State to track if analysis was started manually
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  // State to track the currently active category
  const [activeCategory, setActiveCategory] = useState("overview");

  // Profile data
  const { 
    data: profile, 
    isLoading: profileLoading,
    refetch: refetchProfile,
    isFetching: isProfileFetching,
  } = useGmailProfile({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  // Temporary code emails
  const { 
    data: tempCodeEmails,
    isLoading: tempCodesLoading,
    refetch: refetchTempCodes,
    isFetching: isTempCodesFetching,
  } = useTemporaryCodeEmails({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  // Subscription emails
  const { 
    data: subscriptionEmails,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
    isFetching: isSubscriptionsFetching,
  } = useSubscriptionEmails({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  // Promotional emails
  const { 
    data: promotionalEmails,
    isLoading: promotionsLoading,
    refetch: refetchPromotions,
    isFetching: isPromotionsFetching,
  } = usePromotionalEmails({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  // Newsletter emails
  const { 
    data: newsletterEmails,
    isLoading: newslettersLoading,
    refetch: refetchNewsletters,
    isFetching: isNewslettersFetching,
  } = useNewsletterEmails({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  // Regular emails
  const { 
    data: regularEmails,
    isLoading: regularEmailsLoading,
    refetch: refetchRegularEmails,
    isFetching: isRegularEmailsFetching,
  } = useRegularEmails({
    enabled: analysisStarted // Only fetch when analysis is started
  });
  
  const trashEmailsMutation = useTrashEmails();

  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  
  // State for locally managing emails after removal
  const [localTempCodeEmails, setLocalTempCodeEmails] = useState<TemporaryCodeEmail[]>([]);
  const [localSubscriptionEmails, setLocalSubscriptionEmails] = useState<SubscriptionEmail[]>([]);
  const [localPromotionalEmails, setLocalPromotionalEmails] = useState<PromotionalEmail[]>([]);
  const [localNewsletterEmails, setLocalNewsletterEmails] = useState<NewsletterEmail[]>([]);
  const [localRegularEmails, setLocalRegularEmails] = useState<RegularEmail[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Start analysis function
  const startAnalysis = async () => {
    setAnalysisStarted(true);
    toast({
      title: 'Analysis Started',
      description: 'Analyzing your Gmail inbox...',
      variant: 'default',
    });
    
    // Fetch the data for all categories
    await Promise.all([
      refetchProfile(), 
      refetchTempCodes(),
      refetchSubscriptions(),
      refetchPromotions(),
      refetchNewsletters(),
      refetchRegularEmails()
    ]);
    
    // Simulate loading state for better UX
    setTimeout(() => {
      setDashboardLoaded(true);
    }, 1500);
  };

  // Handle category change from sidebar
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Determine if we're loading
  const isLoading = authLoading || 
                   (analysisStarted && (
                     profileLoading || 
                     tempCodesLoading || 
                     subscriptionsLoading || 
                     promotionsLoading || 
                     newslettersLoading || 
                     regularEmailsLoading || 
                     isProfileFetching || 
                     isTempCodesFetching || 
                     isSubscriptionsFetching || 
                     isPromotionsFetching || 
                     isNewslettersFetching || 
                     isRegularEmailsFetching
                   )) || 
                   (analysisStarted && !dashboardLoaded);

  // Group emails by sender for better organization and bulk actions
  const groupEmailsBySender = (emails) => {
    if (!emails) return [];
    
    const groupedMap = new Map();
    
    emails.forEach(email => {
      if (!groupedMap.has(email.sender)) {
        groupedMap.set(email.sender, []);
      }
      groupedMap.get(email.sender).push(email);
    });
    
    // Convert map to array of groups
    return Array.from(groupedMap.entries()).map(([sender, emails]) => ({
      sender,
      emails,
      count: emails.length,
      totalSize: emails.reduce((total, email) => total + (email.sizeEstimate || 0), 0),
      oldestDaysAgo: Math.max(...emails.map(email => email.daysAgo || 0))
    }));
  };
  
  // Handle deleting emails by moving them to trash
  const handleCleanup = async (emailIds: string[], category?: string, senderInfo?: {email: string, name: string}) => {
    try {
      // Determine which category we're cleaning up based on active category
      const currentCategory = activeCategory || 'unknown';
      
      await trashEmailsMutation.mutateAsync({
        messageIds: emailIds,
        category: category || currentCategory, 
        senderInfo
      });
      
      toast({
        title: 'Success!',
        description: `${emailIds.length} emails have been moved to trash.`,
        variant: 'default',
      });
      
      // Refresh the data after cleanup
      if (analysisStarted) {
        await Promise.all([
          refetchProfile(), 
          refetchTempCodes(),
          refetchSubscriptions(),
          refetchPromotions(),
          refetchNewsletters(),
          refetchRegularEmails()
        ]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move emails to trash. Please try again.',
        variant: 'destructive',
      });
      console.error('Trash emails error:', error);
    }
  };
  
  // Handle removing emails from a specific sender from the cleanup list
  const handleRemoveBySender = (sender: string) => {
    // Implementation based on which category is active
    switch (activeCategory) {
      case 'temp-codes':
        if (tempCodeEmails) {
          const filteredEmails = tempCodeEmails.filter(email => email.sender !== sender);
          setLocalTempCodeEmails(filteredEmails);
          toast({
            title: 'Sender Removed',
            description: `Emails from ${sender} won't be included in cleanup.`,
            variant: 'default',
          });
        }
        break;
      case 'subscriptions':
        if (subscriptionEmails) {
          const filteredEmails = subscriptionEmails.filter(email => email.sender !== sender);
          setLocalSubscriptionEmails(filteredEmails);
          toast({
            title: 'Sender Removed',
            description: `Emails from ${sender} won't be included in cleanup.`,
            variant: 'default',
          });
        }
        break;
      case 'promotions':
        if (promotionalEmails) {
          const filteredEmails = promotionalEmails.filter(email => email.sender !== sender);
          setLocalPromotionalEmails(filteredEmails);
          toast({
            title: 'Sender Removed',
            description: `Emails from ${sender} won't be included in cleanup.`,
            variant: 'default',
          });
        }
        break;
      case 'newsletters':
        if (newsletterEmails) {
          const filteredEmails = newsletterEmails.filter(email => email.sender !== sender);
          setLocalNewsletterEmails(filteredEmails);
          toast({
            title: 'Sender Removed',
            description: `Emails from ${sender} won't be included in cleanup.`,
            variant: 'default',
          });
        }
        break;
      case 'regular':
        if (regularEmails) {
          const filteredEmails = regularEmails.filter(email => email.sender !== sender);
          setLocalRegularEmails(filteredEmails);
          toast({
            title: 'Sender Removed',
            description: `Emails from ${sender} won't be included in cleanup.`,
            variant: 'default',
          });
        }
        break;
      default:
        toast({
          title: 'Sender Removed',
          description: `Emails from ${sender} won't be included in cleanup.`,
          variant: 'default',
        });
    }
  };

  const stats = calculateEmailStats(
    profile, 
    tempCodeEmails,
    subscriptionEmails,
    promotionalEmails,
    newsletterEmails,
    regularEmails
  );
  
  // Calculate category counts for the sidebar
  const categoryCounts = {
    tempCodes: tempCodeEmails?.length || 0,
    subscriptions: subscriptionEmails?.length || 0,
    promotions: promotionalEmails?.length || 0,
    newsletters: newsletterEmails?.length || 0,
    regular: regularEmails?.length || 0
  };

  // Render the appropriate content based on the active category
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'overview':
        return (
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
            
            {/* Category Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Email Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleCategoryChange('temp-codes')}
                  className="border rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Temporary Codes</h3>
                    <p className="text-sm text-gray-500">{categoryCounts.tempCodes} emails</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleCategoryChange('subscriptions')}
                  className="border rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Subscriptions</h3>
                    <p className="text-sm text-gray-500">{categoryCounts.subscriptions} emails</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleCategoryChange('promotions')}
                  className="border rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Promotions</h3>
                    <p className="text-sm text-gray-500">{categoryCounts.promotions} emails</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleCategoryChange('newsletters')}
                  className="border rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <div className="bg-amber-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Newsletters</h3>
                    <p className="text-sm text-gray-500">{categoryCounts.newsletters} emails</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'temp-codes':
        return (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Temporary Verification Codes</h2>
            <p className="text-gray-600 mb-6">
              These are verification codes, OTPs, and temporary login links that are no longer needed.
            </p>
            
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
        );
        
      case 'subscriptions':
        return (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Subscription Emails</h2>
            <p className="text-gray-600 mb-6">
              These are emails from services you've subscribed to, including regular updates from websites and services.
            </p>
            
            <EmailCategoryCard
              icon={
                <svg 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              title="Subscriptions"
              description="Regular emails from services you've subscribed to."
              emails={subscriptionEmails || []}
              onCleanup={handleCleanup}
              isLoading={trashEmailsMutation.isPending}
            />
          </div>
        );
        
      case 'promotions':
        return (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Promotional Emails</h2>
            <p className="text-gray-600 mb-6">
              These are marketing emails including deals, discounts, and promotional offers.
            </p>
            
            <EmailCategoryCard
              icon={
                <svg 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              title="Promotions"
              description="Marketing emails, deals, and promotional offers."
              emails={promotionalEmails || []}
              onCleanup={handleCleanup}
              isLoading={trashEmailsMutation.isPending}
            />
          </div>
        );
        
      case 'newsletters':
        return (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Newsletter Emails</h2>
            <p className="text-gray-600 mb-6">
              These are newsletters, digests, and news alerts from various sources.
            </p>
            
            <EmailCategoryCard
              icon={
                <svg 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              }
              title="Newsletters"
              description="Newsletter emails, news digests, and publications."
              emails={newsletterEmails || []}
              onCleanup={handleCleanup}
              isLoading={trashEmailsMutation.isPending}
            />
          </div>
        );
        
      case 'regular':
        return (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Regular Emails</h2>
            <p className="text-gray-600 mb-6">
              These are regular emails that don't fall into other categories.
            </p>
            
            <EmailCategoryCard
              icon={
                <svg 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              }
              title="Regular Emails"
              description="Regular emails that don't fall into other categories."
              emails={regularEmails || []}
              onCleanup={handleCleanup}
              isLoading={trashEmailsMutation.isPending}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {!analysisStarted ? (
          <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Welcome to Gmail Declutter</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Click the button below to analyze your Gmail inbox and find emails that can be safely removed.
            </p>
            <Button 
              size="lg" 
              onClick={startAnalysis}
              className="bg-[#4285F4] hover:bg-[#3367d6] text-white"
            >
              Start Email Analysis
              <svg 
                className="ml-2 w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="container mx-auto px-4 py-8">
            <LoadingState />
          </div>
        ) : (
          <div className="flex flex-1">
            {/* Sidebar Navigation */}
            <Sidebar 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange} 
              categoryCounts={categoryCounts}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 p-8">
              {renderCategoryContent()}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
