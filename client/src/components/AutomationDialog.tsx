import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType?: string;
  sender?: string;
}

const AutomationDialog: React.FC<AutomationDialogProps> = ({
  open,
  onOpenChange,
  categoryType,
  sender
}) => {
  const [timePeriod, setTimePeriod] = useState('7'); // default 7 days
  const [frequency, setFrequency] = useState('daily');
  const [saveRule, setSaveRule] = useState(true);
  
  // This would actually save the rule to localStorage for persistence
  const handleCreateRule = () => {
    // Create the automation rule
    const rule = {
      id: Date.now().toString(),
      categoryType: categoryType || 'all',
      sender: sender || 'all',
      timePeriod: parseInt(timePeriod),
      frequency,
      createdAt: new Date().toISOString(),
      lastRun: null
    };
    
    // Get existing rules
    const existingRulesStr = localStorage.getItem('automationRules');
    const existingRules = existingRulesStr ? JSON.parse(existingRulesStr) : [];
    
    // Add new rule and save
    const updatedRules = [...existingRules, rule];
    localStorage.setItem('automationRules', JSON.stringify(updatedRules));
    
    toast({
      title: 'Automation Rule Created',
      description: `Emails will be automatically deleted based on your rule settings.`,
      variant: 'default',
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Automation Rule</DialogTitle>
          <DialogDescription>
            Set up automatic deletion for {sender ? `emails from ${sender}` : 
            categoryType ? `${categoryType} emails` : 'emails'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sender" className="text-right">
              Sender
            </Label>
            <Input 
              id="sender" 
              value={sender || 'All Senders'} 
              className="col-span-3" 
              disabled={!!sender}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input 
              id="category" 
              value={categoryType || 'All Categories'} 
              className="col-span-3" 
              disabled={!!categoryType}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time-period" className="text-right">
              Older Than
            </Label>
            <div className="col-span-3 flex items-center">
              <Input 
                id="time-period" 
                type="number" 
                min="1" 
                max="365" 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)} 
                className="mr-2"
              />
              <span>days</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Run
            </Label>
            <Select 
              value={frequency} 
              onValueChange={setFrequency}
            >
              <SelectTrigger id="frequency" className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreateRule}
          >
            Create Rule
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutomationDialog;