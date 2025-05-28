import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Bell, Tag, Newspaper, MessageSquare, FileText } from 'lucide-react';

interface MoveEmailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetCategory: string) => void;
  currentCategory: string;
  emailCount: number;
  senderName?: string;
}

const MoveEmailsDialog: React.FC<MoveEmailsDialogProps> = ({
  isOpen,
  onClose,
  onMove,
  currentCategory,
  emailCount,
  senderName
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const categoryOptions = [
    { 
      id: 'temp-codes', 
      name: 'Temporary Codes', 
      icon: <Key className="h-4 w-4" />,
      description: 'Verification codes and temporary login links'
    },
    { 
      id: 'subscriptions', 
      name: 'Subscriptions', 
      icon: <Bell className="h-4 w-4" />,
      description: 'Recurring service notifications and updates'
    },
    { 
      id: 'promotions', 
      name: 'Promotions', 
      icon: <Tag className="h-4 w-4" />,
      description: 'Marketing emails, deals, and promotional offers'
    },
    { 
      id: 'newsletters', 
      name: 'Newsletters', 
      icon: <Newspaper className="h-4 w-4" />,
      description: 'News, updates, and informational content'
    },
    { 
      id: 'receipts', 
      name: 'Orders & Receipts', 
      icon: <FileText className="h-4 w-4" />,
      description: 'Commercial receipts, orders, bills, and invoices'
    },
    { 
      id: 'regular', 
      name: 'Regular Emails', 
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'General correspondence and other emails'
    }
  ];

  // Filter out the current category
  const availableCategories = categoryOptions.filter(cat => cat.id !== currentCategory);

  const handleMove = () => {
    if (selectedCategory) {
      onMove(selectedCategory);
      setSelectedCategory('');
      onClose();
    }
  };

  const getCurrentCategoryName = () => {
    const category = categoryOptions.find(cat => cat.id === currentCategory);
    return category?.name || currentCategory;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Emails to Different Category</DialogTitle>
          <DialogDescription>
            {senderName ? (
              <>Move {emailCount} emails from <strong>{senderName}</strong> out of <strong>{getCurrentCategoryName()}</strong></>
            ) : (
              <>Move {emailCount} emails out of <strong>{getCurrentCategoryName()}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select target category:
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      {category.icon}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  This will help improve future email classification by moving these emails to a more appropriate category.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove}
            disabled={!selectedCategory}
            className="bg-[#4285F4] hover:bg-[#3367d6] text-white"
          >
            Move Emails
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveEmailsDialog;