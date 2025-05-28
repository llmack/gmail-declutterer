import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TemporaryCodeEmail, 
  SubscriptionEmail, 
  PromotionalEmail, 
  NewsletterEmail, 
  RegularEmail, 
  ReceiptEmail,
  Email 
} from '@/lib/types';
import { getDaysAgoText } from '@/lib/utils';
import PreviewModal from './PreviewModal';
import AutomationDialog from './AutomationDialog';
import MoveEmailsDialog from './MoveEmailsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type CategoryEmail = TemporaryCodeEmail | SubscriptionEmail | PromotionalEmail | NewsletterEmail | RegularEmail | ReceiptEmail;

interface EmailCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  emails: CategoryEmail[];
  onCleanup: (emailIds: string[], category?: string, senderInfo?: {email: string, name: string}) => void;
  onRemoveFromList?: (sender: string, removeSender: boolean) => void;
  onMoveEmails?: (emailIds: string[], targetCategory: string, senderInfo?: {email: string, name: string}) => void;
  currentCategory?: string;
  isLoading?: boolean;
}

const EmailCategoryCard: React.FC<EmailCategoryCardProps> = ({
  icon,
  title,
  description,
  emails,
  onCleanup,
  onRemoveFromList,
  onMoveEmails,
  currentCategory,
  isLoading = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<CategoryEmail | null>(null);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [removeSender, setRemoveSender] = useState(false);
  
  const handleCleanup = () => {
    // Extract all email IDs and call the cleanup handler with the title (category)
    const emailIds = emails.map(email => email.id);
    onCleanup(emailIds, title.toLowerCase());
    setShowPreview(false);
  };
  
  const openRemoveDialog = (email: CategoryEmail) => {
    setSelectedEmail(email);
    setRemoveDialogOpen(true);
    setRemoveSender(false);
  };
  
  const handleRemoveFromList = () => {
    if (selectedEmail && onRemoveFromList) {
      onRemoveFromList(selectedEmail.id, removeSender);
      setRemoveDialogOpen(false);
      setSelectedEmail(null);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#4285F4] mr-2">{icon}</span>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">{emails.length}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-[#4285F4]">
                {emails.length > 0 ? 'Found' : 'None found'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Sender</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Emails</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Age</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {emails.length > 0 ? (
                // Group emails by sender
                Object.entries(
                  emails.reduce<Record<string, CategoryEmail[]>>((acc, email) => {
                    if (!acc[email.sender]) {
                      acc[email.sender] = [];
                    }
                    acc[email.sender].push(email);
                    return acc;
                  }, {})
                ).map(([sender, senderEmails]) => (
                  <tr key={sender} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sender}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {senderEmails.length} emails
                      <span className="text-xs text-gray-500 ml-2 block">
                        Latest: {(senderEmails as any[])[0].subject}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getDaysAgoText(Math.min(...(senderEmails as any[]).map(e => e.daysAgo)))}
                    </td>
                    <td className="px-4 py-3 text-sm flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-white bg-red-500 hover:bg-red-600 flex items-center"
                        onClick={() => {
                          const ids = (senderEmails as any[]).map(e => e.id);
                          // Pass sender information for tracking in deletion history
                          onCleanup(ids, title.toLowerCase(), {
                            email: sender,
                            name: sender
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                      
                      {onRemoveFromList && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-gray-700 border-gray-300 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            // Pass the sender info to the remove handler
                            onRemoveFromList && onRemoveFromList(sender, true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Don't Delete
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-blue-600 hover:bg-blue-50 flex items-center"
                        onClick={() => {
                          setSelectedSender(sender);
                          setAutomationDialogOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Automate
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-sm text-center text-gray-600">
                    No {title.toLowerCase()} emails found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
          <div>
            {emails.length > 3 && (
              <Button 
                variant="link" 
                className="text-sm text-[#4285F4] hover:text-blue-700 font-medium p-0"
                onClick={() => setShowPreview(true)}
              >
                View all
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 transition-colors duration-200"
              onClick={() => setShowPreview(true)}
              disabled={emails.length === 0 || isLoading}
            >
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              className="px-3 py-1.5 text-sm rounded-md bg-[#4285F4] text-white hover:bg-blue-600 transition-colors duration-200"
              onClick={handleCleanup}
              disabled={emails.length === 0 || isLoading}
            >
              {isLoading ? 'Processing...' : 'Move to Trash'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleCleanup}
        emails={emails}
        title={`Preview ${title} Cleanup`}
        isLoading={isLoading}
      />
      
      {/* Automation Dialog */}
      <AutomationDialog
        open={automationDialogOpen}
        onOpenChange={setAutomationDialogOpen}
        categoryType={title}
        sender={selectedSender || undefined}
      />

      {/* Remove from list dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from list</DialogTitle>
            <DialogDescription>
              Do you want to remove just this email or all emails from this sender?
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="p-4 my-2 border rounded-md bg-gray-50">
              <p className="font-medium text-gray-700">{selectedEmail.sender}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedEmail.subject}</p>
            </div>
          )}
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="just-this" 
                checked={!removeSender} 
                onChange={() => setRemoveSender(false)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="just-this" className="text-sm text-gray-700">
                Just this email
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="all-from-sender" 
                checked={removeSender} 
                onChange={() => setRemoveSender(true)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="all-from-sender" className="text-sm text-gray-700">
                All emails from this sender
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRemoveFromList}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailCategoryCard;
