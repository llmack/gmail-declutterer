export interface User {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
}

export interface AuthState {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet?: string;
  date: string;
  labelIds?: string[];
  sizeEstimate?: number;
}

export interface TemporaryCodeEmail extends Email {
  codeType: 'verification' | 'otp' | 'security';
  code?: string;
  isExpired?: boolean;
  daysAgo: number;
}

export interface SubscriptionEmail extends Email {
  sender: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  daysAgo: number;
}

export interface PromotionalEmail extends Email {
  sender: string;
  promotionType?: 'deal' | 'coupon' | 'sale' | 'offer';
  daysAgo: number;
}

export interface NewsletterEmail extends Email {
  sender: string;
  newsletterType?: 'news' | 'update' | 'digest' | 'alert';
  daysAgo: number;
}

export interface RegularEmail extends Email {
  sender: string;
  daysAgo: number;
}

export interface EmailStats {
  totalEmails: number;
  storageUsed: string;
  declutterPotential: number;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface TrashEmailResponse {
  success: boolean;
  results: {
    messageId: string;
    success: boolean;
    data?: any;
    error?: any;
  }[];
}
