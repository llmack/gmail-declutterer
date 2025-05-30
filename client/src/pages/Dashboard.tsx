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
  useRegularEmails,
  useReceiptEmails
} from '@/hooks/useGmailAPI';
import { 
  TemporaryCodeEmail, 
  SubscriptionEmail, 
  PromotionalEmail, 
  NewsletterEmail, 
  RegularEmail,
  ReceiptEmail
} from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import StatsCard from '@/components/StatsCard';
import EmailCategoryCard from '@/components/EmailCategoryCard';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  // Create a ref for the dashboard element
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading: authLoading } = useGoogleAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State to track if analysis was started manually
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  // State to track the currently active category
  const [activeCategory, setActiveCategory] = useState("overview");
  
  // State to store senders that should be excluded from deletion
  const [excludedSenders, setExcludedSenders] = useState<string[]>([]);

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
  
  // Receipt, Order, and Bill emails
  const { 
    data: receiptEmails,
    isLoading: receiptEmailsLoading,
    refetch: refetchReceiptEmails,
    isFetching: isReceiptEmailsFetching,
  } = useReceiptEmails({
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
  const [localReceiptEmails, setLocalReceiptEmails] = useState<ReceiptEmail[]>([]);
  
  // Track moved emails by sender to prevent them from appearing in multiple categories
  const [movedSenders, setMovedSenders] = useState<Record<string, {from: string, to: string, emailIds: string[]}>>({});

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
      refetchRegularEmails(),
      refetchReceiptEmails()
    ]);
    
    // Simulate loading state for better UX
    setTimeout(() => {
      setDashboardLoaded(true);
    }, 1500);
  };

  // Manual refresh function
  const handleRefresh = async () => {
    if (!analysisStarted) {
      toast({
        title: 'Analysis Required',
        description: 'Please start the analysis first before refreshing.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Refreshing...',
      description: 'Re-analyzing your Gmail inbox...',
      variant: 'default',
    });
    
    // Clear moved senders and excluded senders for fresh analysis
    setMovedSenders({});
    
    // Fetch the data for all categories
    await Promise.all([
      refetchProfile(), 
      refetchTempCodes(),
      refetchSubscriptions(),
      refetchPromotions(),
      refetchNewsletters(),
      refetchRegularEmails(),
      refetchReceiptEmails()
    ]);
    
    toast({
      title: 'Refresh Complete',
      description: 'Your inbox analysis has been updated.',
      variant: 'default',
    });
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
                     receiptEmailsLoading || 
                     isProfileFetching || 
                     isTempCodesFetching || 
                     isSubscriptionsFetching || 
                     isPromotionsFetching || 
                     isNewslettersFetching || 
                     isRegularEmailsFetching ||
                     isReceiptEmailsFetching
                   )) || 
                   (analysisStarted && !dashboardLoaded);

  // Group emails by sender for better organization and bulk actions
  const groupEmailsBySender = (emails: any[]) => {
    if (!emails) return [];
    
    const groupedMap = new Map();
    
    // Sort emails by daysAgo in descending order (oldest first)
    const sortedEmails = [...emails].sort((a, b) => (b.daysAgo || 0) - (a.daysAgo || 0));
    
    sortedEmails.forEach(email => {
      if (!groupedMap.has(email.sender)) {
        groupedMap.set(email.sender, {
          sender: email.sender,
          emails: [email],
          count: 1,
          oldestDate: email.date,
          newestDate: email.date,
          totalSize: email.sizeEstimate || 0
        });
      } else {
        const group = groupedMap.get(email.sender);
        group.emails.push(email);
        group.count++;
        group.totalSize += email.sizeEstimate || 0;
        
        // Update oldest and newest dates
        if (new Date(email.date) < new Date(group.oldestDate)) {
          group.oldestDate = email.date;
        }
        if (new Date(email.date) > new Date(group.newestDate)) {
          group.newestDate = email.date;
        }
      }
    });
    
    // Convert map to array and sort by count (descending)
    return Array.from(groupedMap.values()).sort((a, b) => b.count - a.count);
  };

  // Function to filter emails based on moves and exclusions
  const getFilteredEmails = (emails: any[], currentCategory: string) => {
    if (!emails) return [];
    
    return emails.filter(email => {
      // First check if sender is excluded
      if (excludedSenders.includes(email.sender)) {
        return false;
      }
      
      // Check if this sender has been moved from this category
      const moveRecord = movedSenders[email.sender];
      if (moveRecord && moveRecord.from === currentCategory) {
        return false; // Don't show in original category after move
      }
      
      return true;
    });
  };

  // Handle deleting emails by moving them to trash
  const handleCleanup = async (emailIds: string[], category?: string, senderInfo?: {email: string, name: string}) => {
    try {
      // Determine which category we're cleaning up based on active category
      const currentCategory = activeCategory || 'unknown';
      
      console.log(`Moving ${emailIds.length} emails to trash from category ${category || currentCategory}`);
      
      const response = await trashEmailsMutation.mutateAsync({
        messageIds: emailIds,
        category: category || currentCategory, 
        senderInfo
      });
      
      console.log('Trash response:', response);
      
      if (response.success) {
        toast({
          title: 'Success!',
          description: `${emailIds.length} emails have been moved to trash.`,
          variant: 'default',
        });
        
        // No automatic refresh - user will manually refresh when needed
        
        // If deletion was for a specific sender, go back to category view
        if (senderInfo) {
          // Stay on the same category view
        } else if (category) {
          // Go back to overview when done with a category
          setActiveCategory('overview');
        }
      } else {
        toast({
          title: 'Warning',
          description: 'Some emails could not be moved to trash. Please try again.',
          variant: 'destructive',
        });
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
  
  // Handle toggling a sender in the excluded list (for "Don't Delete" functionality)
  const handleExcludeSender = (sender: string, shouldExclude: boolean) => {
    if (shouldExclude) {
      // Add sender to excluded list
      const newExcludedSenders = [...excludedSenders, sender];
      setExcludedSenders(newExcludedSenders);
      // Store in localStorage for persistence
      localStorage.setItem('excludedSenders', JSON.stringify(newExcludedSenders));
      
      toast({
        title: 'Sender Excluded',
        description: `Emails from "${sender}" will be excluded from cleanup.`,
        variant: 'default',
      });
    } else {
      // Remove sender from excluded list
      const newExcludedSenders = excludedSenders.filter(s => s !== sender);
      setExcludedSenders(newExcludedSenders);
      localStorage.setItem('excludedSenders', JSON.stringify(newExcludedSenders));
      
      toast({
        title: 'Sender Included',
        description: `Emails from "${sender}" will be included in cleanup.`,
        variant: 'default',
      });
    }
  };
  
  // Load excluded senders from localStorage on component mount
  useEffect(() => {
    const storedExcludedSenders = localStorage.getItem('excludedSenders');
    if (storedExcludedSenders) {
      try {
        setExcludedSenders(JSON.parse(storedExcludedSenders));
      } catch (e) {
        console.error('Error parsing stored excluded senders:', e);
      }
    }
  }, []);
  
  // Set up event listener for the "set-overview" event from header
  useEffect(() => {
    const dashboardElement = dashboardRef.current;
    
    const handleSetOverview = () => {
      setActiveCategory('overview');
    };
    
    if (dashboardElement) {
      dashboardElement.id = 'dashboard-component';
      dashboardElement.addEventListener('set-overview', handleSetOverview);
    }
    
    return () => {
      if (dashboardElement) {
        dashboardElement.removeEventListener('set-overview', handleSetOverview);
      }
    };
  }, []);

  const stats = calculateEmailStats(
    profile, 
    tempCodeEmails,
    subscriptionEmails,
    promotionalEmails,
    newsletterEmails,
    regularEmails,
    receiptEmails
  );
  
  // Calculate category counts for the sidebar using filtered emails
  const categoryCounts = {
    tempCodes: getFilteredEmails(tempCodeEmails || [], 'temp-codes').length,
    subscriptions: getFilteredEmails(subscriptionEmails || [], 'subscriptions').length,
    promotions: getFilteredEmails(promotionalEmails || [], 'promotions').length,
    newsletters: getFilteredEmails(newsletterEmails || [], 'newsletters').length,
    regular: getFilteredEmails(regularEmails || [], 'regular').length,
    receipts: getFilteredEmails(receiptEmails || [], 'receipts').length
  };

  if (authLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" ref={dashboardRef}>
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
              {activeCategory === 'overview' && (
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
                      
                      {/* Categories Count Card */}
                      <StatsCard
                        title="Email Categories"
                        value={Object.values(categoryCounts).reduce((a, b) => a + b, 0).toLocaleString()}
                        icon={
                          <svg 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            strokeWidth={2}
                            className="w-6 h-6"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        }
                        color="text-[#34A853]"
                      />
                    </div>
                  </div>
                  
                  {/* Category Summary */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium text-gray-900">Email Categories</h2>
                      <div className="flex space-x-3">
                        {/* Refresh Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRefresh}
                          disabled={isLoading}
                          className="text-[#4285F4] border-[#4285F4] hover:bg-[#4285F4] hover:text-white"
                        >
                          <svg 
                            className="mr-2 w-4 h-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Category-specific content */}
              {activeCategory === 'temp-codes' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                  title="Temporary Verification Codes"
                  description="These are verification codes, OTPs, and temporary login links that are no longer needed."
                  emails={getFilteredEmails(tempCodeEmails || [], 'temp-codes')}
                  onCleanup={handleCleanup}
                  currentCategory="temp-codes"
                />
              )}
              
              {activeCategory === 'subscriptions' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  title="Subscription Emails"
                  description="These are recurring emails from services you may no longer need."
                  emails={getFilteredEmails(subscriptionEmails || [], 'subscriptions')}
                  onCleanup={handleCleanup}
                  currentCategory="subscriptions"
                />
              )}
              
              {activeCategory === 'promotions' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" /></svg>}
                  title="Promotional Emails"
                  description="These are promotional emails, deals, and marketing messages."
                  emails={getFilteredEmails(promotionalEmails || [], 'promotions')}
                  onCleanup={handleCleanup}
                  currentCategory="promotions"
                />
              )}
              
              {activeCategory === 'newsletters' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                  title="Newsletter Emails"
                  description="These are newsletters, news updates, and informational emails."
                  emails={getFilteredEmails(newsletterEmails || [], 'newsletters')}
                  onCleanup={handleCleanup}
                  currentCategory="newsletters"
                />
              )}
              
              {activeCategory === 'receipts' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  title="Orders & Receipts"
                  description="These are receipts, orders, bills, and purchase confirmations from commercial sources."
                  emails={getFilteredEmails(receiptEmails || [], 'receipts')}
                  onCleanup={handleCleanup}
                  currentCategory="receipts"
                />
              )}
              
              {activeCategory === 'regular' && (
                <EmailCategoryCard
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  title="Regular Communication"
                  description="These are regular emails that don't fit into other categories."
                  emails={getFilteredEmails(regularEmails || [], 'regular')}
                  onCleanup={handleCleanup}
                  currentCategory="regular"
                />
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;