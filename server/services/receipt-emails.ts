import { getMessage, listMessages, parseSenderName } from './gmail';
import type { ReceiptEmail } from '@/lib/types';

export async function getReceiptEmails(accessToken: string): Promise<ReceiptEmail[]> {
  try {
    // Query to find receipts, orders, bills and invoices
    const query = 'receipt OR order OR invoice OR bill OR purchase OR payment OR transaction OR confirmation OR "order confirmation" OR "shipping confirmation" OR "order details" OR "payment receipt"';
    
    const messages = await listMessages(accessToken, query, 100);
    
    const receiptEmails: ReceiptEmail[] = [];
    
    for (const message of messages) {
      try {
        const fullMessage = await getMessage(accessToken, message.id!);
        
        if (!fullMessage || !fullMessage.payload) {
          continue;
        }
        
        const headers = fullMessage.payload.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const dateHeader = headers.find(h => h.name === 'Date')?.value;
        
        const date = dateHeader ? new Date(dateHeader) : new Date();
        const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine the type of receipt email
        let receiptType: 'order' | 'bill' | 'receipt' | 'invoice' | undefined;
        
        const lowerSubject = subject.toLowerCase();
        if (lowerSubject.includes('order') || lowerSubject.includes('purchase') || lowerSubject.includes('shipping')) {
          receiptType = 'order';
        } else if (lowerSubject.includes('bill') || lowerSubject.includes('payment due')) {
          receiptType = 'bill';
        } else if (lowerSubject.includes('invoice')) {
          receiptType = 'invoice';
        } else if (lowerSubject.includes('receipt') || lowerSubject.includes('payment') || lowerSubject.includes('transaction')) {
          receiptType = 'receipt';
        }
        
        receiptEmails.push({
          id: fullMessage.id!,
          sender: parseSenderName(from),
          subject,
          snippet: fullMessage.snippet || '',
          date: date.toISOString(),
          labelIds: fullMessage.labelIds || [],
          sizeEstimate: fullMessage.sizeEstimate || 0,
          receiptType,
          daysAgo,
        });
      } catch (err) {
        console.error(`Error processing message ${message.id}:`, err);
      }
    }
    
    return receiptEmails;
  } catch (error) {
    console.error('Error fetching receipt emails:', error);
    throw error;
  }
}