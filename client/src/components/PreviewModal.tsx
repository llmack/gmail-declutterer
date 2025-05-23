import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TemporaryCodeEmail, 
  SubscriptionEmail, 
  PromotionalEmail, 
  NewsletterEmail, 
  RegularEmail 
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

type CategoryEmail = TemporaryCodeEmail | SubscriptionEmail | PromotionalEmail | NewsletterEmail | RegularEmail;

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  emails: CategoryEmail[];
  title: string;
  isLoading?: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  emails,
  title,
  isLoading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            The following {emails.length} emails will be moved to trash:
          </p>
          
          <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-lg mb-4">
            <table className="min-w-full">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Sender</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Emails</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {/* Group by sender in preview as well */}
                {Object.entries(
                  emails.reduce((acc, email) => {
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
                      {(senderEmails as any[]).length} emails
                      <div className="text-xs text-gray-500 mt-1">
                        {(senderEmails as any[]).slice(0, 2).map((email: any) => (
                          <div key={email.id} className="truncate max-w-sm">• {email.subject}</div>
                        ))}
                        {(senderEmails as any[]).length > 2 && 
                          <div className="text-gray-400">+ {(senderEmails as any[]).length - 2} more</div>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate((senderEmails as any[])[0].date)} - 
                      {formatDate((senderEmails as any[])[(senderEmails as any[]).length - 1].date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Alert className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <AlertDescription className="flex items-start text-amber-800">
              <svg 
                className="w-5 h-5 text-amber-500 mr-2 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                These emails will be moved to trash and can be restored from there for 30 days before being permanently deleted by Gmail.
              </span>
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#4285F4] text-white hover:bg-blue-600"
          >
            {isLoading ? 'Processing...' : 'Proceed with Cleanup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
