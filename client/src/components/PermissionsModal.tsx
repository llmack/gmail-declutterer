import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Permissions Explained</DialogTitle>
          <DialogDescription>
            Learn more about the permissions required by Gmail Declutter
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Read Gmail Messages</h3>
            <p className="text-sm text-gray-600">
              This permission allows us to scan your inbox to identify temporary codes, 
              promotions, and other email categories. We only read metadata (sender, subject, date) 
              unless strictly necessary.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Modify Gmail Messages</h3>
            <p className="text-sm text-gray-600">
              This permission lets us move emails to trash when you approve a cleanup action. 
              We will never delete emails permanently without your express approval.
            </p>
          </div>
          
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
            <div className="flex items-start">
              <svg 
                className="w-5 h-5 text-[#4285F4] mr-2 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Data Privacy</h3>
                <p className="text-sm text-gray-600">
                  We don't store your email content on our servers. All processing happens 
                  client-side in your browser. We only keep track of your rule preferences 
                  and action history.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            I understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsModal;
