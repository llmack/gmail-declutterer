import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEmailAnalysis } from "@/hooks/useEmailAnalysis";
import { format, formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const PreviewDeleteModal: React.FC = () => {
  const { 
    emailsToDelete,
    showDeleteModal,
    setShowDeleteModal,
    setEmailsToDelete,
    deleteEmails,
    deletingEmails
  } = useEmailAnalysis();
  const { toast } = useToast();

  const handleClose = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      await deleteEmails();
      toast({
        title: "Deletion Successful",
        description: `${emailsToDelete.length} emails have been moved to trash.`,
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete emails. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto py-4">
          <div className="mb-6">
            <div className="flex items-center text-warning mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm font-medium">
                You're about to delete{" "}
                <span className="font-bold">{emailsToDelete.length}</span> emails
              </p>
            </div>

            <DialogDescription className="mb-4">
              These emails will be moved to your Gmail Trash folder. You can recover them from there for the next 30 days, or use the Undo feature immediately after deletion.
            </DialogDescription>
          </div>

          <div className="border border-border rounded-lg overflow-hidden mb-6">
            <div className="bg-background px-4 py-2 border-b border-border">
              <div className="grid grid-cols-10 gap-2">
                <div className="col-span-3 text-sm font-medium text-text-secondary">Sender</div>
                <div className="col-span-5 text-sm font-medium text-text-secondary">Subject</div>
                <div className="col-span-2 text-sm font-medium text-text-secondary">Received</div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {emailsToDelete.map((email) => (
                <div
                  key={email.messageId}
                  className="px-4 py-3 bg-surface hover:bg-background transition-colors"
                >
                  <div className="grid grid-cols-10 gap-2">
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
                    <div className="col-span-2 text-sm text-text-secondary">
                      {formatDate(email.receivedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={deletingEmails}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="inline-flex items-center"
            onClick={handleDelete}
            disabled={deletingEmails}
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
            {deletingEmails ? "Deleting..." : "Delete Emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDeleteModal;
