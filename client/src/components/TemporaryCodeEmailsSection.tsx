import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format, formatDistance } from "date-fns";
import { useEmailAnalysis } from "@/hooks/useEmailAnalysis";
import { TempCodeEmailInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TemporaryCodeEmailsSectionProps {
  emails: TempCodeEmailInfo[];
  loading: boolean;
  refreshEmails: () => void;
}

const TemporaryCodeEmailsSection: React.FC<TemporaryCodeEmailsSectionProps> = ({ 
  emails,
  loading,
  refreshEmails
}) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { setEmailsToDelete } = useEmailAnalysis();
  const { toast } = useToast();

  // Reset selections when emails change
  useEffect(() => {
    setSelectedEmails([]);
    setSelectAll(false);
  }, [emails]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmails(emails.map(email => email.messageId));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, messageId]);
    } else {
      setSelectedEmails(prev => prev.filter(id => id !== messageId));
    }
  };

  const handlePreviewDelete = () => {
    if (selectedEmails.length === 0) {
      toast({
        title: "No emails selected",
        description: "Please select at least one email to delete.",
        variant: "destructive",
      });
      return;
    }

    // Filter selected emails from the full list
    const emailsToDelete = emails.filter(email => 
      selectedEmails.includes(email.messageId)
    );
    
    setEmailsToDelete(emailsToDelete);
  };

  // Check if selectAll should be updated based on selections
  useEffect(() => {
    if (emails.length > 0 && selectedEmails.length === emails.length) {
      setSelectAll(true);
    } else if (selectAll && selectedEmails.length !== emails.length) {
      setSelectAll(false);
    }
  }, [selectedEmails, emails, selectAll]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-card p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-sans text-lg font-medium text-text-primary">
          Temporary Code Emails
        </h3>

        <div className="flex items-center">
          <span className="text-sm text-text-secondary mr-2">
            {emails.length} found
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="inline-flex items-center"
            onClick={handlePreviewDelete}
            disabled={selectedEmails.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="mr-1 h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Preview Delete
          </Button>
        </div>
      </div>

      {/* Temporary code emails list */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-background px-4 py-2 border-b border-border">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">
              <Checkbox 
                id="selectAllTempCodes"
                checked={selectAll}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
            </div>
            <div className="col-span-3 text-sm font-medium text-text-secondary">Sender</div>
            <div className="col-span-5 text-sm font-medium text-text-secondary">Subject</div>
            <div className="col-span-3 text-sm font-medium text-text-secondary">Received</div>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-text-secondary">Loading emails...</p>
            </div>
          </div>
        ) : emails.length > 0 ? (
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email.messageId}
                className="px-4 py-3 bg-surface hover:bg-background transition-colors"
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedEmails.includes(email.messageId)}
                      onCheckedChange={(checked) => 
                        handleSelectEmail(email.messageId, checked as boolean)
                      }
                    />
                  </div>
                  <div className="col-span-3 truncate text-sm">
                    <div className="font-medium text-text-primary">
                      {email.from?.split('<')[0]?.trim() || 'Unknown Sender'}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {email.fromEmail || email.from?.match(/<(.+)>/)?.[1] || ''}
                    </div>
                  </div>
                  <div className="col-span-5 text-sm text-text-primary truncate">
                    {email.subject || email.snippet || 'No subject'}
                  </div>
                  <div className="col-span-3 text-sm text-text-secondary">
                    {formatDate(email.receivedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-12 w-12 text-text-secondary mb-2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <p className="text-text-secondary">No temporary code emails found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={refreshEmails}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemporaryCodeEmailsSection;
