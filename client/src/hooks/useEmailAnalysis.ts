import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { EmailStats, TempCodeEmailInfo } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export const useEmailAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [emailsToDelete, setEmailsToDelete] = useState<TempCodeEmailInfo[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch email stats
  const {
    data: emailStats,
    isLoading: loadingStats,
    refetch: refetchStats
  } = useQuery<EmailStats>({
    queryKey: ['/api/gmail/stats'],
    enabled: false, // Don't fetch on component mount
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch temporary code emails
  const {
    data: tempCodeEmails = [],
    isLoading: loadingTempCodeEmails,
    refetch: refetchTempCodeEmails
  } = useQuery<TempCodeEmailInfo[]>({
    queryKey: ['/api/gmail/temp-code-emails'],
    enabled: false, // Don't fetch on component mount
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Analyze emails mutation
  const analyzeEmailsMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      setLoadingMessage('Analyzing your emails...');
      const response = await apiRequest('GET', '/api/gmail/stats');
      return response.json();
    },
    onSuccess: (data: EmailStats) => {
      queryClient.setQueryData(['/api/gmail/stats'], data);
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error analyzing emails:', error);
      setLoading(false);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze your emails. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete emails mutation
  const deleteEmailsMutation = useMutation({
    mutationFn: async () => {
      const messageIds = emailsToDelete.map(email => email.messageId);
      const response = await apiRequest('POST', '/api/gmail/delete-emails', { messageIds });
      return response.json();
    },
    onSuccess: () => {
      // Clear the deleted emails
      setEmailsToDelete([]);
      setShowDeleteModal(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/temp-code-emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/stats'] });
      
      toast({
        title: 'Emails Deleted',
        description: `${emailsToDelete.length} emails moved to trash successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error deleting emails:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete emails. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Analyze emails function
  const analyzeEmails = useCallback(async () => {
    try {
      await analyzeEmailsMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Error analyzing emails:', error);
      return false;
    }
  }, [analyzeEmailsMutation]);

  // Fetch temp code emails function
  const fetchTempCodeEmails = useCallback(async () => {
    try {
      await refetchTempCodeEmails();
      return true;
    } catch (error) {
      console.error('Error fetching temporary code emails:', error);
      return false;
    }
  }, [refetchTempCodeEmails]);

  // Delete emails function
  const deleteEmails = useCallback(async () => {
    try {
      await deleteEmailsMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Error deleting emails:', error);
      return false;
    }
  }, [deleteEmailsMutation, emailsToDelete]);

  return {
    loading: loading || loadingStats || analyzeEmailsMutation.isPending,
    loadingMessage,
    emailStats,
    analyzing: analyzeEmailsMutation.isPending,
    analyzeEmails,
    tempCodeEmails,
    loadingTempCodeEmails,
    fetchTempCodeEmails,
    emailsToDelete,
    setEmailsToDelete: (emails: TempCodeEmailInfo[]) => {
      setEmailsToDelete(emails);
      setShowDeleteModal(true);
    },
    showDeleteModal,
    setShowDeleteModal,
    deleteEmails,
    deletingEmails: deleteEmailsMutation.isPending,
  };
};
