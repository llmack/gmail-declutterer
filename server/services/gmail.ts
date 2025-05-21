import { google } from 'googleapis';
import { oAuth2Client, getAuthClientForUser } from './auth';
import { Email, TemporaryCodeEmail } from '@shared/schema';

export async function getProfile(accessToken: string) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  const response = await gmail.users.getProfile({ userId: 'me' });
  return response.data;
}

export async function listMessages(accessToken: string, query: string = '', maxResults: number = 50) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });
  
  return response.data.messages || [];
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
  // Search query for potential temporary code emails
  const query = 'subject:(verification OR code OR otp OR "security code" OR "confirmation code")';
  
  try {
    const messages = await listMessages(accessToken, query, 20);
    
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

export async function moveMessageToTrash(accessToken: string, messageId: string) {
  const client = getAuthClientForUser(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: client });
  
  const response = await gmail.users.messages.trash({
    userId: 'me',
    id: messageId,
  });
  
  return response.data;
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
function parseSenderName(sender: string): string {
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
