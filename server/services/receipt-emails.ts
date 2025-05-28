import { getMessage, listMessages, parseSenderName } from './gmail';
import type { ReceiptEmail } from '@/lib/types';

export async function getReceiptEmails(accessToken: string): Promise<ReceiptEmail[]> {
  try {
    // More specific query to find commercial receipts, orders, bills and invoices
    const query = '(receipt OR order OR invoice OR bill OR purchase OR payment OR transaction OR confirmation OR "order confirmation" OR "shipping confirmation" OR "order details" OR "payment receipt") AND (-from:personal -from:friend -from:family)';
    
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
        
        // More refined filtering for commercial sources only
        const senderEmail = from.toLowerCase();
        const senderName = parseSenderName(from).toLowerCase();
        const lowerSubject = subject.toLowerCase();
        
        // Skip personal/individual emails
        const personalIndicators = [
          'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
          'personal', 'friend', 'family', '@student', '@edu'
        ];
        
        const isPersonalEmail = personalIndicators.some(indicator => 
          senderEmail.includes(indicator) && !senderEmail.includes('noreply') && !senderEmail.includes('no-reply')
        );
        
        if (isPersonalEmail) {
          continue;
        }
        
        // Check for commercial receipt indicators
        const commercialIndicators = [
          'noreply', 'no-reply', 'receipt', 'order', 'invoice', 'billing', 'payment',
          'shop', 'store', 'amazon', 'paypal', 'stripe', 'square', 'uber', 'lyft',
          'doordash', 'grubhub', 'apple', 'google', 'microsoft', 'netflix', 'spotify'
        ];
        
        const receiptKeywords = [
          'receipt', 'order confirmation', 'purchase confirmation', 'payment confirmation',
          'invoice', 'bill', 'payment received', 'transaction', 'order details',
          'shipping confirmation', 'delivery confirmation', 'payment summary'
        ];
        
        const hasCommercialIndicator = commercialIndicators.some(indicator => 
          senderEmail.includes(indicator) || senderName.includes(indicator)
        );
        
        const hasReceiptKeywords = receiptKeywords.some(keyword => 
          lowerSubject.includes(keyword)
        );
        
        // Only include if it has commercial indicators AND receipt keywords
        if (!hasCommercialIndicator && !hasReceiptKeywords) {
          continue;
        }
        
        // Determine the type of receipt email
        let receiptType: 'order' | 'bill' | 'receipt' | 'invoice' | undefined;
        
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