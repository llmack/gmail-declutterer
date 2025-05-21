import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import MemoryStore from 'memorystore';
import { storage } from "./storage";
import { generateAuthUrl, handleGoogleCallback, isAuthenticated } from "./services/auth";
import { getProfile, getTemporaryCodeEmails, batchMoveToTrash } from "./services/gmail";

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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
      
      // Redirect to frontend
      res.redirect('/');
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

  app.post('/api/gmail/trash', isAuthenticated, async (req, res) => {
    try {
      const { messageIds } = req.body;
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ message: 'Message IDs are required' });
      }
      
      const results = await batchMoveToTrash(req.session.accessToken!, messageIds);
      
      // Record deletion in history
      await storage.createDeletionHistory({
        userId: req.session.userId!,
        categoryType: 'temporary_code',
        count: messageIds.length,
        emailIds: messageIds
      });
      
      res.json({ success: true, results });
    } catch (error) {
      console.error('Error moving messages to trash:', error);
      res.status(500).json({ message: 'Failed to move messages to trash', error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
