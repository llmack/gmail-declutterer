import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

// Simple working History page
const History: React.FC = () => {
  const [deletionHistory, setDeletionHistory] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [excludedSenders, setExcludedSenders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      try {
        // Load deletion history
        const historyStr = localStorage.getItem('deletionHistory');
        if (historyStr) {
          const history = JSON.parse(historyStr);
          // Filter to last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentHistory = history.filter((item: any) => {
            const itemDate = new Date(item.timestamp || item.createdAt);
            return itemDate >= thirtyDaysAgo;
          });
          
          setDeletionHistory(recentHistory);
        }

        // Load automation rules
        const rulesStr = localStorage.getItem('automationRules');
        if (rulesStr) {
          setAutomationRules(JSON.parse(rulesStr));
        }

        // Load excluded senders
        const excludedStr = localStorage.getItem('excludedSenders');
        if (excludedStr) {
          setExcludedSenders(JSON.parse(excludedStr));
        }
      } catch (e) {
        console.error('Error loading history data:', e);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getTotalEmailsDeleted = () => {
    return deletionHistory.reduce((total, entry) => total + (entry.emailCount || entry.count || 0), 0);
  };

  const getTotalStorageSaved = () => {
    const totalEmails = getTotalEmailsDeleted();
    const averageEmailSizeKB = 100;
    const totalSavedKB = totalEmails * averageEmailSizeKB;
    return (totalSavedKB / 1024).toFixed(2);
  };

  const getGmailTrashLink = (sender?: string) => {
    if (sender) {
      const encodedSender = encodeURIComponent(`from:${sender}`);
      return `https://mail.google.com/mail/u/0/#search/in%3Atrash+${encodedSender}`;
    }
    return `https://mail.google.com/mail/u/0/#trash`;
  };

  const handleRemoveExclusion = (sender: string) => {
    const updatedSenders = excludedSenders.filter(s => s !== sender);
    setExcludedSenders(updatedSenders);
    localStorage.setItem('excludedSenders', JSON.stringify(updatedSenders));
  };

  const clearHistory = () => {
    setDeletionHistory([]);
    setAutomationRules([]);
    localStorage.removeItem('deletionHistory');
    localStorage.removeItem('automationRules');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9fafb]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Deletion History</h1>
                <p className="text-gray-600">
                  Track your email cleanup activity and recover emails if needed. History is kept for 30 days.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => window.open(getGmailTrashLink(), '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  View Gmail Trash
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
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
                  <span className="text-sm text-gray-600">Automation Rules</span>
                  <span className="text-3xl font-bold text-gray-900">{automationRules.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Excluded Senders</span>
                  <span className="text-3xl font-bold text-gray-900">{excludedSenders.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Automation Rules */}
          {automationRules.length > 0 && (
            <Card className="bg-white shadow-sm mb-8">
              <CardHeader>
                <CardTitle>Active Automation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  These rules automatically delete emails based on your settings.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Age Threshold</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Frequency</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Created</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {automationRules.map((rule: any) => (
                        <tr key={rule.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {rule.categoryType}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Older than {rule.timePeriod} days
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                            {rule.frequency}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(rule.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => {
                                const updatedRules = automationRules.filter(r => r.id !== rule.id);
                                setAutomationRules(updatedRules);
                                localStorage.setItem('automationRules', JSON.stringify(updatedRules));
                              }}
                            >
                              Delete Rule
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excluded Senders */}
          {excludedSenders.length > 0 && (
            <Card className="bg-white shadow-sm mb-8">
              <CardHeader>
                <CardTitle>Excluded Senders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  These senders are excluded from cleanup operations.
                </p>
                
                <div className="flex flex-wrap gap-2">
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

          {/* Deletion History */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Recent Deletion Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {deletionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Emails</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {deletionHistory.slice(0, 50).map((entry: any, index: number) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(entry.timestamp || entry.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {entry.category || entry.categoryType}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {entry.action === 'automation_rule_applied' ? 'Automation Rule' : 'Manual Deletion'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {entry.emailCount || entry.count || 0}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-blue-600 border-blue-300 hover:bg-blue-50"
                              onClick={() => window.open(getGmailTrashLink(), '_blank')}
                            >
                              View in Trash
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No deletion history found.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start cleaning up your emails to see your activity here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default History;