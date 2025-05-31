import { google } from 'googleapis';
import { oAuth2Client, getAuthClientForUser } from './auth';
import { 
  Email, 
  TemporaryCodeEmail
} from '@shared/schema';
import type {
  SubscriptionEmail,
  PromotionalEmail,
  NewsletterEmail,
  RegularEmail,
  ReceiptEmail
} from '@/lib/types';

export async function getProfile(accessToken: string) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  const response = await gmail.users.getProfile({ userId: 'me' });
  return response.data;
}

export async function listMessages(accessToken: string, query: string = '', maxResults: number = 100) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  // Note: Gmail API doesn't directly support sorting by date in the API
  // We'll sort the results after fetching them
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query + ' -in:trash', // Exclude items in trash
    maxResults,
  });
  
  return response.data.messages || [];
}

export async function listMessagesWithPagination(accessToken: string, query: string = '', totalLimit: number = 1000) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  let allMessages: any[] = [];
  let nextPageToken: string | undefined;
  const pageSize = 500; // Gmail API max per request is 500
  
  console.log(`Fetching up to ${totalLimit} emails with query: ${query}`);
  
  while (allMessages.length < totalLimit) {
    const remainingEmails = totalLimit - allMessages.length;
    const currentPageSize = Math.min(pageSize, remainingEmails);
    
    console.log(`Fetching batch ${Math.floor(allMessages.length / pageSize) + 1}, requesting ${currentPageSize} emails...`);
    
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query + ' -in:trash', // Exclude items in trash
        maxResults: currentPageSize,
        pageToken: nextPageToken,
      });
      
      const messages = response.data.messages || [];
      allMessages = allMessages.concat(messages);
      
      console.log(`Fetched ${messages.length} emails, total so far: ${allMessages.length}`);
      
      nextPageToken = response.data.nextPageToken ?? undefined;
      
      // Break if no more pages or no messages returned
      if (!nextPageToken || messages.length === 0) {
        console.log('No more pages available or no messages returned');
        break;
      }
      
    } catch (error) {
      console.error('Error fetching email batch:', error);
      break;
    }
  }
  
  console.log(`Finished fetching emails. Total retrieved: ${allMessages.length}`);
  return allMessages;
}

export async function getMessage(accessToken: string, messageId: string) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'metadata',
    metadataHeaders: ['From', 'Subject', 'Date'],
  });
  
  return response.data;
}

export async function getTemporaryCodeEmails(accessToken: string): Promise<TemporaryCodeEmail[]> {
  // Enhanced search query for temporary code emails - much more comprehensive
  const query = 'subject:(verification OR code OR otp OR "security code" OR "confirmation code" OR "verify" OR "authenticate" OR "login code" OR "access code" OR "pin" OR "token" OR "two-factor" OR "2fa" OR "multi-factor" OR "mfa" OR "sign in" OR "activation" OR "validation" OR "temporary" OR "one-time") OR from:(noreply OR "no-reply" OR security OR auth OR verification OR support)';
  
  try {
    // Use pagination to get up to 1000 emails
    const messages = await listMessagesWithPagination(accessToken, query, 1000);
    
    if (!messages.length) {
      return [];
    }
    
    const temporaryCodeEmails: TemporaryCodeEmail[] = [];
    
    for (const message of messages) {
      try {
        const fullMessage = await getMessage(accessToken, message.id!);
        
        const headers = fullMessage.payload?.headers || [];
        const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
        const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
        const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
        
        if (!fromHeader || !subjectHeader || !dateHeader) {
          continue;
        }
        
        const sender = fromHeader.value || '';
        const subject = subjectHeader.value || '';
        const dateStr = dateHeader.value || '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if it's actually a temporary code email
        const isVerification = /verification|verify|confirm/i.test(subject);
        const isOtp = /otp|one-?time|passcode/i.test(subject);
        const isSecurityCode = /security code|secure|authentication/i.test(subject);
        const hasCode = /\b\d{4,8}\b/.test(subject);
        
        if ((isVerification || isOtp || isSecurityCode || hasCode)) {
          let codeType: 'verification' | 'otp' | 'security' = 'verification';
          
          if (isOtp) {
            codeType = 'otp';
          } else if (isSecurityCode) {
            codeType = 'security';
          }
          
          // Extract code if present in subject
          const codeMatch = subject.match(/\b\d{4,8}\b/);
          const code = codeMatch ? codeMatch[0] : undefined;
          
          temporaryCodeEmails.push({
            id: fullMessage.id!,
            sender: parseSenderName(sender),
            subject,
            snippet: fullMessage.snippet || '',
            date: date.toISOString(),
            labelIds: fullMessage.labelIds || [],
            sizeEstimate: fullMessage.sizeEstimate || 0,
            codeType,
            code,
            isExpired: daysAgo > 1, // Consider codes older than 1 day expired
            daysAgo,
          });
        }
      } catch (err) {
        console.error(`Error processing message ${message.id}:`, err);
      }
    }
    
    return temporaryCodeEmails;
  } catch (error) {
    console.error('Error fetching temporary code emails:', error);
    throw error;
  }
}

export async function moveMessageToTrash(accessToken: string, messageId: string, refreshToken?: string) {
  try {
    // Create authenticated client with refresh token for automatic token refresh
    const client = getAuthClientForUser(accessToken, refreshToken);
    const gmail = google.gmail({ version: 'v1', auth: client });
    
    console.log(`Gmail API: Moving message ${messageId} to trash`);
    
    // First try the trash endpoint
    try {
      const response = await gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });
      
      console.log(`Successfully moved message ${messageId} to trash`);
      return response.data;
    } catch (trashError: any) {
      console.error(`Error using trash endpoint for ${messageId}:`, {
        message: trashError.message,
        code: trashError.code,
        status: trashError.status,
        details: trashError.response?.data || trashError
      });
      
      // If trash fails, try modify with TRASH label
      console.log(`Falling back to modify endpoint for message ${messageId}`);
      try {
        const modifyResponse = await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: ['TRASH'],
            removeLabelIds: ['INBOX']
          }
        });
        
        console.log(`Successfully modified message ${messageId} with TRASH label`);
        return modifyResponse.data;
      } catch (modifyError: any) {
        console.error(`Error using modify endpoint for ${messageId}:`, {
          message: modifyError.message,
          code: modifyError.code,
          status: modifyError.status,
          details: modifyError.response?.data || modifyError
        });
        throw modifyError;
      }
    }
  } catch (error: any) {
    console.error(`Failed to move message ${messageId} to trash:`, {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data || error
    });
    throw new Error(`Cannot move email to trash: ${error.message || 'Unknown error'}`);
  }
}

export async function batchMoveToTrash(accessToken: string, messageIds: string[]) {
  const results = [];
  
  for (const messageId of messageIds) {
    try {
      const result = await moveMessageToTrash(accessToken, messageId);
      results.push({ messageId, success: true, data: result });
    } catch (error) {
      results.push({ messageId, success: false, error });
    }
  }
  
  return results;
}

// Helper function to extract sender name from email
export function parseSenderName(sender: string): string {
  // Extract name from "Name <email@example.com>" format
  const match = sender.match(/^"?([^"<]+)"?\s*(?:<[^>]+>)?$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no name found, try to extract domain from email
  const emailMatch = sender.match(/<([^>]+)>/);
  if (emailMatch && emailMatch[1]) {
    const domain = emailMatch[1].split('@')[1];
    if (domain) {
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    }
  }
  
  return sender;
}
