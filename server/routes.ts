import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import MemoryStore from 'memorystore';
import { storage } from "./storage";
import { generateAuthUrl, handleGoogleCallback, isAuthenticated } from "./services/auth";
import { 
  getProfile, 
  getTemporaryCodeEmails, 
  batchMoveToTrash,
  moveMessageToTrash,
  listMessages,
  listMessagesWithPagination,
  getMessage,
  parseSenderName
} from "./services/gmail";
import { getReceiptEmails } from "./services/receipt-emails";

// Define custom session type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    accessToken?: string;
    refreshToken?: string;
  }
}

// Create memory store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'gmail-declutter-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to false for Replit to work properly
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Allow cross-site requests for OAuth
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Authentication endpoints
  app.get('/api/auth/url', (req, res) => {
    const url = generateAuthUrl();
    res.json({ url });
  });

  app.get('/api/auth/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'Authorization code is required' });
      }

      const user = await handleGoogleCallback(code);
      
      // Set user in session
      req.session.userId = user.id;
      
      if (user.accessToken) {
        req.session.accessToken = user.accessToken;
      }
      
      if (user.refreshToken) {
        req.session.refreshToken = user.refreshToken;
      }
      
      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        console.log('Session saved successfully, user ID:', user.id);
        // Redirect to dashboard
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).json({ message: 'Authentication failed', error: (error as Error).message });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ authenticated: false });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  // Gmail API endpoints
  app.get('/api/gmail/profile', isAuthenticated, async (req, res) => {
    try {
      const profile = await getProfile(req.session.accessToken!);
      res.json(profile);
    } catch (error) {
      console.error('Error fetching Gmail profile:', error);
      res.status(500).json({ message: 'Failed to fetch Gmail profile', error: (error as Error).message });
    }
  });

  app.get('/api/gmail/temp-codes', isAuthenticated, async (req, res) => {
    try {
      const emails = await getTemporaryCodeEmails(req.session.accessToken!);
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'temporary_code');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: emails.length,
          sampleEmails: emails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'temporary_code',
          count: emails.length,
          sampleEmails: emails.slice(0, 10)
        });
      }
      
      res.json(emails);
    } catch (error) {
      console.error('Error fetching temporary code emails:', error);
      res.status(500).json({ message: 'Failed to fetch temporary code emails', error: (error as Error).message });
    }
  });

  // New endpoints for additional email categories
  app.get('/api/gmail/subscriptions', isAuthenticated, async (req, res) => {
    try {
      // Query for subscription-like emails
      // Enhanced query for subscription emails - much more comprehensive
      const query = 'subject:(subscription OR unsubscribe OR weekly OR monthly OR daily OR newsletter OR digest OR updates OR "mailing list" OR "email list" OR "subscribe" OR "notifications" OR "alerts" OR "member" OR "account" OR "billing" OR "statement") OR from:(newsletter OR digest OR updates OR notifications OR mailinglist OR "no-reply" OR noreply OR marketing OR communications OR support OR billing OR accounts)';
      const messages = await listMessagesWithPagination(req.session.accessToken!, query, 1000);
      const subscriptionEmails = [];
      
      for (const message of messages) {
        try {
          const fullMessage = await getMessage(req.session.accessToken!, message.id!);
          
          const headers = fullMessage.payload?.headers || [];
          const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
          const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
          const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
          
          if (!fromHeader || !subjectHeader || !dateHeader) continue;
          
          const sender = fromHeader.value || '';
          const subject = subjectHeader.value || '';
          const dateStr = dateHeader.value || '';
          const date = new Date(dateStr);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine frequency based on subject patterns
          let frequency: 'daily' | 'weekly' | 'monthly' = 'monthly';
          const subjectLower = subject.toLowerCase();
          
          if (subjectLower.includes('daily') || subjectLower.includes('today')) {
            frequency = 'daily';
          } else if (subjectLower.includes('weekly') || subjectLower.includes('week')) {
            frequency = 'weekly';
          }
          
          subscriptionEmails.push({
            id: fullMessage.id!,
            sender: parseSenderName(sender),
            subject,
            snippet: fullMessage.snippet || '',
            date: date.toISOString(),
            labelIds: fullMessage.labelIds || [],
            sizeEstimate: fullMessage.sizeEstimate || 0,
            frequency,
            daysAgo,
          });
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
        }
      }
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'subscription');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: subscriptionEmails.length,
          sampleEmails: subscriptionEmails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'subscription',
          count: subscriptionEmails.length,
          sampleEmails: subscriptionEmails.slice(0, 10)
        });
      }
      
      res.json(subscriptionEmails);
    } catch (error) {
      console.error('Error fetching subscription emails:', error);
      res.status(500).json({ message: 'Failed to fetch subscription emails', error: (error as Error).message });
    }
  });
  
  app.get('/api/gmail/promotions', isAuthenticated, async (req, res) => {
    try {
      // Enhanced query for promotional emails - much more comprehensive
      const query = 'subject:(discount OR sale OR offer OR % OR deal OR promotion OR coupon OR promo OR special OR limited OR save OR free OR bonus OR exclusive OR flash OR clearance OR "black friday" OR "cyber monday" OR "spring sale" OR "summer sale" OR "winter sale" OR "holiday sale") OR from:(noreply OR marketing OR promo OR deals OR offers OR sales)';
      const messages = await listMessagesWithPagination(req.session.accessToken!, query, 1000);
      const promotionalEmails = [];
      
      for (const message of messages) {
        try {
          const fullMessage = await getMessage(req.session.accessToken!, message.id!);
          
          const headers = fullMessage.payload?.headers || [];
          const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
          const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
          const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
          
          if (!fromHeader || !subjectHeader || !dateHeader) continue;
          
          const sender = fromHeader.value || '';
          const subject = subjectHeader.value || '';
          const dateStr = dateHeader.value || '';
          const date = new Date(dateStr);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine promotion type based on subject
          let promotionType: 'deal' | 'coupon' | 'sale' | 'offer' = 'offer';
          const subjectLower = subject.toLowerCase();
          
          if (subjectLower.includes('deal')) {
            promotionType = 'deal';
          } else if (subjectLower.includes('coupon') || subjectLower.includes('code')) {
            promotionType = 'coupon';
          } else if (subjectLower.includes('sale')) {
            promotionType = 'sale';
          }
          
          promotionalEmails.push({
            id: fullMessage.id!,
            sender: parseSenderName(sender),
            subject,
            snippet: fullMessage.snippet || '',
            date: date.toISOString(),
            labelIds: fullMessage.labelIds || [],
            sizeEstimate: fullMessage.sizeEstimate || 0,
            promotionType,
            daysAgo,
          });
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
        }
      }
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'promotional');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: promotionalEmails.length,
          sampleEmails: promotionalEmails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'promotional',
          count: promotionalEmails.length,
          sampleEmails: promotionalEmails.slice(0, 10)
        });
      }
      
      res.json(promotionalEmails);
    } catch (error) {
      console.error('Error fetching promotional emails:', error);
      res.status(500).json({ message: 'Failed to fetch promotional emails', error: (error as Error).message });
    }
  });
  
  app.get('/api/gmail/newsletters', isAuthenticated, async (req, res) => {
    try {
      // Enhanced query for newsletter emails - much more comprehensive
      const query = 'subject:(newsletter OR digest OR news OR update OR alert OR bulletin OR briefing OR "weekly wrap" OR "daily news" OR "morning brief" OR "evening update" OR "industry news" OR "tech news" OR "business news" OR "market update" OR "press release" OR "announcement") OR from:(news OR newsletter OR digest OR briefing OR bulletin OR press OR media OR "morning-brief" OR "daily-digest")';
      const messages = await listMessagesWithPagination(req.session.accessToken!, query, 1000);
      const newsletterEmails = [];
      
      for (const message of messages) {
        try {
          const fullMessage = await getMessage(req.session.accessToken!, message.id!);
          
          const headers = fullMessage.payload?.headers || [];
          const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
          const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
          const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
          
          if (!fromHeader || !subjectHeader || !dateHeader) continue;
          
          const sender = fromHeader.value || '';
          const subject = subjectHeader.value || '';
          const dateStr = dateHeader.value || '';
          const date = new Date(dateStr);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine newsletter type based on subject
          let newsletterType: 'news' | 'update' | 'digest' | 'alert' = 'news';
          const subjectLower = subject.toLowerCase();
          
          if (subjectLower.includes('update')) {
            newsletterType = 'update';
          } else if (subjectLower.includes('digest')) {
            newsletterType = 'digest';
          } else if (subjectLower.includes('alert')) {
            newsletterType = 'alert';
          }
          
          newsletterEmails.push({
            id: fullMessage.id!,
            sender: parseSenderName(sender),
            subject,
            snippet: fullMessage.snippet || '',
            date: date.toISOString(),
            labelIds: fullMessage.labelIds || [],
            sizeEstimate: fullMessage.sizeEstimate || 0,
            newsletterType,
            daysAgo,
          });
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
        }
      }
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'newsletter');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: newsletterEmails.length,
          sampleEmails: newsletterEmails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'newsletter',
          count: newsletterEmails.length,
          sampleEmails: newsletterEmails.slice(0, 10)
        });
      }
      
      res.json(newsletterEmails);
    } catch (error) {
      console.error('Error fetching newsletter emails:', error);
      res.status(500).json({ message: 'Failed to fetch newsletter emails', error: (error as Error).message });
    }
  });
  
  app.get('/api/gmail/receipts', isAuthenticated, async (req, res) => {
    try {
      const receiptEmails = await getReceiptEmails(req.session.accessToken!);
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'receipt');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: receiptEmails.length,
          sampleEmails: receiptEmails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'receipt',
          count: receiptEmails.length,
          sampleEmails: receiptEmails.slice(0, 10)
        });
      }
      
      res.json(receiptEmails);
    } catch (error) {
      console.error('Error fetching receipt emails:', error);
      res.status(500).json({ message: 'Failed to fetch receipt emails', error: (error as Error).message });
    }
  });

  app.get('/api/gmail/regular', isAuthenticated, async (req, res) => {
    try {
      // Enhanced query for regular emails - excluding all categorized email types
      const query = '-subject:(verification OR code OR otp OR "security code" OR verify OR authenticate OR subscription OR unsubscribe OR newsletter OR digest OR news OR update OR alert OR discount OR sale OR offer OR deal OR promotion OR coupon OR promo OR special OR limited OR save OR free OR bonus OR exclusive OR receipt OR order OR invoice OR bill OR purchase OR payment OR transaction OR confirmation OR "order confirmation") AND -from:(noreply OR "no-reply" OR marketing OR promo OR deals OR offers OR sales OR newsletter OR digest OR updates OR notifications OR security OR auth OR verification OR support OR billing OR accounts)';
      const messages = await listMessagesWithPagination(req.session.accessToken!, query, 1000);
      const regularEmails = [];
      
      for (const message of messages) {
        try {
          const fullMessage = await getMessage(req.session.accessToken!, message.id!);
          
          const headers = fullMessage.payload?.headers || [];
          const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
          const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
          const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');
          
          if (!fromHeader || !subjectHeader || !dateHeader) continue;
          
          const sender = fromHeader.value || '';
          const subject = subjectHeader.value || '';
          const dateStr = dateHeader.value || '';
          const date = new Date(dateStr);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          regularEmails.push({
            id: fullMessage.id!,
            sender: parseSenderName(sender),
            subject,
            snippet: fullMessage.snippet || '',
            date: date.toISOString(),
            labelIds: fullMessage.labelIds || [],
            sizeEstimate: fullMessage.sizeEstimate || 0,
            daysAgo,
          });
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
        }
      }
      
      // Store the results in email category
      const userId = req.session.userId!;
      const existingCategory = await storage.getEmailCategoryByType(userId, 'regular');
      
      if (existingCategory) {
        await storage.updateEmailCategory(existingCategory.id, {
          count: regularEmails.length,
          sampleEmails: regularEmails.slice(0, 10)
        });
      } else {
        await storage.createEmailCategory({
          userId,
          categoryType: 'regular',
          count: regularEmails.length,
          sampleEmails: regularEmails.slice(0, 10)
        });
      }
      
      res.json(regularEmails);
    } catch (error) {
      console.error('Error fetching regular emails:', error);
      res.status(500).json({ message: 'Failed to fetch regular emails', error: (error as Error).message });
    }
  });

  app.post('/api/gmail/trash', isAuthenticated, async (req, res) => {
    try {
      console.log('Received trash request with body:', JSON.stringify(req.body));
      const { messageIds, category, senderInfo } = req.body;
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        console.log('Invalid request - messageIds missing or empty');
        return res.status(400).json({ message: 'Message IDs are required' });
      }
      
      console.log(`Attempting to move ${messageIds.length} emails to trash from category ${category || 'unknown'}`);
      console.log('Using access token:', req.session.accessToken ? 'Valid token present' : 'No token');
      
      // Process messages individually and collect results
      const allResults = [];
      let successCount = 0;
      
      for (const messageId of messageIds) {
        try {
          console.log(`Trashing message ID: ${messageId}`);
          const result = await moveMessageToTrash(req.session.accessToken!, messageId);
          console.log(`Successfully trashed message: ${messageId}`);
          allResults.push({ messageId, success: true, data: result });
          successCount++;
        } catch (error) {
          console.error(`Error trashing email ${messageId}:`, error);
          allResults.push({ 
            messageId, 
            success: false, 
            error: (error as any).message || 'Unknown error'
          });
        }
      }
      
      const success = successCount > 0;
      console.log(`Trash operation completed: ${successCount} of ${messageIds.length} emails trashed successfully`);
      
      // Only record history if at least one email was successfully moved
      if (success) {
        console.log('Recording deletion in history');
        // Record deletion in history with sender information for better tracking
        await storage.createDeletionHistory({
          userId: req.session.userId!,
          categoryType: category || 'unknown',
          count: successCount,
          emailIds: messageIds.slice(0, successCount),
          senderEmail: senderInfo?.email || 'unknown',
          senderName: senderInfo?.name || 'unknown'
        });
      }
      
      console.log('Sending response:', { success, resultCount: allResults.length });
      res.json({ success, results: allResults });
    } catch (error) {
      console.error('Error moving messages to trash:', error);
      res.status(500).json({ message: 'Failed to move messages to trash', error: (error as Error).message });
    }
  });
  
  // Add endpoint to retrieve deletion history
  app.get('/api/history/deletions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const deletionHistory = await storage.getDeletionHistory(userId);
      
      res.json(deletionHistory);
    } catch (error) {
      console.error('Error fetching deletion history:', error);
      res.status(500).json({ message: 'Failed to fetch deletion history', error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
