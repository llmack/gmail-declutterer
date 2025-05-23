import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingState from '@/components/LoadingState';
import { DeletionHistory } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Use the DeletionHistory type from our schema
type DeletionEntry = DeletionHistory & {
  category: string; // For UI display purposes
}

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [excludedSenders, setExcludedSenders] = useState<string[]>([]);
  
  // Use the proper queryFn to fetch deletion history
  const { data: deletionHistory, isLoading } = useQuery({
    queryKey: ['/api/history/deletions'],
    queryFn: getQueryFn<DeletionEntry[]>({ on401: 'throw' }),
  });
  
  // Load excluded senders from localStorage
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
  
  // Function to remove a sender from the excluded list
  const handleRemoveExclusion = (sender: string) => {
    const updatedSenders = excludedSenders.filter(s => s !== sender);
    setExcludedSenders(updatedSenders);
    localStorage.setItem('excludedSenders', JSON.stringify(updatedSenders));
    toast({
      title: 'Sender Removed from Exclusion List',
      description: `${sender} will no longer be excluded from cleanup.`,
      variant: 'default',
    });
  };
  
  // Group deletion history by sender
  const groupedBySender = React.useMemo(() => {
    if (!deletionHistory) return {} as Record<string, DeletionEntry[]>;
    
    return deletionHistory.reduce<Record<string, DeletionEntry[]>>((acc, entry) => {
      // Use senderEmail for grouping
      const senderKey = entry.senderEmail || 'unknown';
      if (!acc[senderKey]) {
        acc[senderKey] = [];
      }
      acc[senderKey].push(entry);
      return acc;
    }, {});
  }, [deletionHistory]);
  
  // Function to create a Gmail search URL to view trashed emails from a sender
  const getGmailTrashLink = (sender: string) => {
    const encodedSender = encodeURIComponent(`from:${sender}`);
    return `https://mail.google.com/mail/u/0/#search/in%3Atrash+${encodedSender}`;
  };
  
  const getTotalEmailsDeleted = () => {
    if (!deletionHistory) return 0;
    return deletionHistory.reduce((total, entry) => total + entry.count, 0);
  };
  
  // Calculate total storage saved (in MB)
  const getTotalStorageSaved = () => {
    if (!deletionHistory) return 0;
    
    // Estimate based on average email size (100KB per email as a conservative estimate)
    const totalEmails = getTotalEmailsDeleted();
    const averageEmailSizeKB = 100; // 100KB average size
    const totalSavedKB = totalEmails * averageEmailSizeKB;
    
    // Convert to MB for display
    return (totalSavedKB / 1024).toFixed(2);
  };
  
  // Filter by category if a specific tab is selected
  const filteredHistory = React.useMemo(() => {
    if (activeTab === 'all' || !deletionHistory) return deletionHistory || [];
    return (deletionHistory || []).filter(entry => entry.categoryType.toLowerCase() === activeTab);
  }, [deletionHistory, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Deletion History</h1>
            <p className="text-gray-600">
              Track your email cleanup activity and recover emails if needed.
            </p>
          </div>
          
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Total Emails Deleted</span>
                      <span className="text-3xl font-bold text-gray-900">{getTotalEmailsDeleted()}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Storage Saved</span>
                      <span className="text-3xl font-bold text-gray-900">
                        {getTotalStorageSaved()} MB
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Senders Affected</span>
                      <span className="text-3xl font-bold text-gray-900">{Object.keys(groupedBySender).length}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Last Cleanup</span>
                      <span className="text-lg font-bold text-gray-900">
                        {deletionHistory && deletionHistory.length > 0 && deletionHistory[0].deletedAt
                          ? formatDate(deletionHistory[0].deletedAt.toString())
                          : 'No cleanups yet'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Excluded Senders Section */}
              {excludedSenders.length > 0 && (
                <Card className="bg-white shadow-sm mb-8">
                  <CardHeader>
                    <CardTitle>Excluded Senders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      These senders have been excluded from cleanup operations. Their emails will not be moved to trash.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {excludedSenders.map(sender => (
                        <div key={sender} className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-md border text-sm">
                          {sender}
                          <button 
                            onClick={() => handleRemoveExclusion(sender)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                            title="Remove from exclusion list"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="temporary">Temporary Codes</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                  <TabsTrigger value="promotions">Promotions</TabsTrigger>
                  <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
                  <TabsTrigger value="regular">Regular</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>All Deleted Emails</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredHistory && filteredHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Sender</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Category</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Count</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {Object.entries(groupedBySender).map(([sender, entries]) => {
                                // Calculate total deleted emails for this sender
                                const totalCount = (entries as DeletionHistory[]).reduce((sum, entry) => sum + entry.count, 0);
                                
                                // Calculate storage saved for this sender (using 100KB per email as estimate)
                                const storageSavedKB = totalCount * 100; // 100KB per email
                                const storageSavedMB = (storageSavedKB / 1024).toFixed(1);
                                
                                // Find the latest deletion date
                                const latestDate = new Date(Math.max(
                                  ...(entries as DeletionHistory[]).map(e => new Date(e.deletedAt).getTime())
                                ));
                                
                                // Get categories for this sender's deletions
                                const categories = Array.from(new Set((entries as DeletionHistory[]).map(e => e.categoryType)))
                                  .map(cat => {
                                    // Make category names more readable
                                    switch(cat) {
                                      case 'temporary_code': return 'Temporary Codes';
                                      case 'subscription': return 'Subscriptions';
                                      case 'promotional': return 'Promotions';
                                      case 'newsletter': return 'Newsletters';
                                      case 'regular': return 'Regular';
                                      default: return cat;
                                    }
                                  })
                                  .join(', ');
                                
                                return (
                                  <tr key={sender} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sender}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{categories}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {totalCount} 
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({storageSavedMB} MB)
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(latestDate.toISOString())}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(getGmailTrashLink(sender), '_blank')}
                                        className="h-8"
                                      >
                                        View in Gmail
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No deletion history found. Start decluttering your inbox to track your progress here.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Category-specific tabs would have similar content with filtered data */}
                {['temporary', 'subscriptions', 'promotions', 'newsletters', 'regular'].map(category => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Deleted Emails</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {filteredHistory && filteredHistory.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-neutral-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Sender</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Count</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {Object.entries(
                                  filteredHistory.reduce((acc, entry) => {
                                    if (!acc[entry.senderEmail]) {
                                      acc[entry.senderEmail] = [];
                                    }
                                    acc[entry.senderEmail].push(entry);
                                    return acc;
                                  }, {} as Record<string, DeletionEntry[]>)
                                ).map(([sender, entries]) => {
                                  const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
                                  const latestDate = new Date(Math.max(
                                    ...entries.map(e => new Date(e.timestamp).getTime())
                                  ));
                                  
                                  return (
                                    <tr key={sender} className="hover:bg-neutral-50">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{sender}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{totalCount}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(latestDate.toISOString())}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(getGmailTrashLink(sender), '_blank')}
                                          className="h-8"
                                        >
                                          View in Gmail
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            No deletion history found for {category} emails.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default History;