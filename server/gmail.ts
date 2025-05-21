import type { Express } from "express";
import { IStorage } from "./storage";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Create OAuth2 client
export function getOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/callback";
  
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Setup Gmail API routes
export function setupGmailRoutes(app: Express, storage: IStorage, requireAuth: any) {
  // Get email stats
  app.get("/api/gmail/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Setup auth client
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
      });
      
      // Create Gmail API client
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      
      // Get profile to calculate storage
      const profile = await gmail.users.getProfile({
        userId: "me",
      });
      
      // Get total count of messages
      const messages = await gmail.users.messages.list({
        userId: "me",
        maxResults: 1,
      });
      
      // Find temporary code emails
      const tempCodeEmails = await findTemporaryCodeEmails(gmail);
      
      // Create analysis record
      const analysis = await storage.createEmailAnalysis({
        userId,
        totalEmails: Number(profile.data.messagesTotal) || 0,
        storageUsed: Number(profile.data.storageUsed) || 0,
        potentialCleanup: tempCodeEmails.length * 100000, // Estimate 100KB per temp code email
        tempCodeCount: tempCodeEmails.length,
      });
      
      // Store temp code emails for later reference
      await Promise.all(
        tempCodeEmails.map((email) =>
          storage.createTempCodeEmail({
            userId,
            messageId: email.id,
            threadId: email.threadId,
            from: email.from,
            fromEmail: email.fromEmail,
            subject: email.subject,
            snippet: email.snippet,
            receivedAt: email.receivedAt ? new Date(email.receivedAt) : undefined,
          })
        )
      );
      
      // Return email stats
      res.json({
        totalEmails: Number(profile.data.messagesTotal) || 0,
        storageUsed: Number(profile.data.storageUsed) || 0,
        potentialCleanup: tempCodeEmails.length * 100000, // Estimate
        tempCodeCount: tempCodeEmails.length,
      });
    } catch (error) {
      console.error("Error getting email stats:", error);
      res.status(500).json({ message: "Failed to retrieve email statistics" });
    }
  });

  // Get temporary code emails
  app.get("/api/gmail/temp-code-emails", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get temp code emails from storage
      const tempCodeEmails = await storage.getTempCodeEmailsByUser(userId);
      
      res.json(tempCodeEmails);
    } catch (error) {
      console.error("Error getting temp code emails:", error);
      res.status(500).json({ message: "Failed to retrieve temporary code emails" });
    }
  });

  // Delete emails
  app.post("/api/gmail/delete-emails", requireAuth, async (req, res) => {
    try {
      const { messageIds } = req.body;
      
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ message: "No message IDs provided" });
      }
      
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Setup auth client
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
      });
      
      // Create Gmail API client
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      
      // Batch delete emails by moving to trash
      await Promise.all(
        messageIds.map((messageId) =>
          gmail.users.messages.trash({
            userId: "me",
            id: messageId,
          })
        )
      );
      
      // Remove deleted emails from storage
      await storage.deleteTempCodeEmails(userId, messageIds);
      
      res.json({ success: true, deletedCount: messageIds.length });
    } catch (error) {
      console.error("Error deleting emails:", error);
      res.status(500).json({ message: "Failed to delete emails" });
    }
  });
}

// Helper function to find temporary code emails
async function findTemporaryCodeEmails(gmail: any) {
  try {
    // Search for emails with common verification code patterns
    const queries = [
      "subject:(verification code OR security code OR confirm OR authentication OR passcode OR OTP)",
      "subject:(your code OR access code OR login code)",
    ];
    
    const results = [];
    
    for (const query of queries) {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 100,
      });
      
      if (response.data.messages && response.data.messages.length > 0) {
        // Get full message details for each result
        for (const message of response.data.messages) {
          const messageDetails = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });
          
          // Extract headers
          const headers = messageDetails.data.payload.headers;
          const from = headers.find((h: any) => h.name === "From")?.value || "";
          const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
          const date = headers.find((h: any) => h.name === "Date")?.value || "";
          
          // Extract email from the From field (e.g., "Name <email@example.com>")
          const fromEmailMatch = from.match(/<([^>]+)>/) || [null, from];
          const fromEmail = fromEmailMatch[1];
          
          // Check if subject contains verification code patterns
          const hasVerificationCode = /code|verification|confirm|verify|otp|password|pin|auth/i.test(subject);
          
          if (hasVerificationCode) {
            results.push({
              id: message.id,
              threadId: message.threadId,
              from,
              fromEmail,
              subject,
              snippet: messageDetails.data.snippet,
              receivedAt: date,
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error finding temporary code emails:", error);
    return [];
  }
}
