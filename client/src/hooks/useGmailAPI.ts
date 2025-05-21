import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { TemporaryCodeEmail, GmailProfile, TrashEmailResponse } from '@/lib/types';

export function useGmailProfile() {
  return useQuery<GmailProfile>({
    queryKey: ['/api/gmail/profile'],
  });
}

export function useTemporaryCodeEmails() {
  return useQuery<TemporaryCodeEmail[]>({
    queryKey: ['/api/gmail/temp-codes'],
    refetchOnWindowFocus: false,
  });
}

export function useTrashEmails() {
  const queryClient = useQueryClient();
  
  return useMutation<TrashEmailResponse, Error, string[]>({
    mutationFn: async (messageIds: string[]) => {
      const response = await apiRequest('POST', '/api/gmail/trash', { messageIds });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/temp-codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/profile'] });
    }
  });
}

export function calculateEmailStats(profile?: GmailProfile, tempCodes?: TemporaryCodeEmail[]) {
  if (!profile) {
    return {
      totalEmails: 0,
      storageUsed: '0 MB',
      declutterPotential: 0
    };
  }

  const totalEmails = profile.messagesTotal || 0;
  
  // Assuming average email size is 75KB
  const averageEmailSizeKB = 75;
  const estimatedStorageBytes = totalEmails * averageEmailSizeKB * 1024;
  
  // Convert to appropriate unit
  let storageUsed: string;
  if (estimatedStorageBytes < 1024 * 1024) {
    storageUsed = `${(estimatedStorageBytes / 1024).toFixed(1)} KB`;
  } else if (estimatedStorageBytes < 1024 * 1024 * 1024) {
    storageUsed = `${(estimatedStorageBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    storageUsed = `${(estimatedStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  // Calculate declutter potential
  const tempCodesCount = tempCodes?.length || 0;
  // In a real implementation, this would consider other categories too
  const declutterPotential = tempCodesCount > 0 
    ? Math.min(Math.round((tempCodesCount / totalEmails) * 100), 100) 
    : 0;

  return {
    totalEmails,
    storageUsed,
    declutterPotential
  };
}
