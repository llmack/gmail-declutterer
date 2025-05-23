import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  TemporaryCodeEmail, 
  GmailProfile, 
  TrashEmailResponse,
  SubscriptionEmail,
  PromotionalEmail,
  NewsletterEmail,
  RegularEmail
} from '@/lib/types';



export function useGmailProfile(options = {}) {
  return useQuery<GmailProfile>({
    queryKey: ['/api/gmail/profile'],
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function useTemporaryCodeEmails(options = {}) {
  return useQuery<TemporaryCodeEmail[]>({
    queryKey: ['/api/gmail/temp-codes'],
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function useSubscriptionEmails(options = {}) {
  return useQuery<SubscriptionEmail[]>({
    queryKey: ['/api/gmail/subscriptions'],
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function usePromotionalEmails(options = {}) {
  return useQuery<PromotionalEmail[]>({
    queryKey: ['/api/gmail/promotions'],
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function useNewsletterEmails(options = {}) {
  return useQuery<NewsletterEmail[]>({
    queryKey: ['/api/gmail/newsletters'],
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function useRegularEmails(options = {}) {
  return useQuery<RegularEmail[]>({
    queryKey: ['/api/gmail/regular'],
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch on component mount
    ...options
  });
}

export function useTrashEmails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      messageIds: string[]; 
      category?: string;
      senderInfo?: { email: string; name: string };
    }) => {
      console.log('Trashing emails:', data);
      const response = await fetch('/api/gmail/trash', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trash emails: ${response.statusText}`);
      }
      
      return response.json() as Promise<TrashEmailResponse>;
    },
    onSuccess: () => {
      // Invalidate all Gmail data queries
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/temp-codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/promotions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/regular'] });
      queryClient.invalidateQueries({ queryKey: ['/api/history/deletions'] });
    }
  });
}

export function calculateEmailStats(
  profile?: GmailProfile, 
  tempCodes?: TemporaryCodeEmail[],
  subscriptions?: SubscriptionEmail[],
  promotions?: PromotionalEmail[],
  newsletters?: NewsletterEmail[],
  regular?: RegularEmail[]
) {
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
  const subscriptionsCount = subscriptions?.length || 0;
  const promotionsCount = promotions?.length || 0;
  const newslettersCount = newsletters?.length || 0;
  
  // Calculate total declutterable emails
  const totalDeclutterable = tempCodesCount + subscriptionsCount + promotionsCount + newslettersCount;
  
  // Calculate declutter potential as a percentage
  const declutterPotential = totalDeclutterable > 0 && totalEmails > 0
    ? Math.min(Math.round((totalDeclutterable / totalEmails) * 100), 100) 
    : 0;

  return {
    totalEmails,
    storageUsed,
    declutterPotential
  };
}
