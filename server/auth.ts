import type { Express } from "express";
import { IStorage } from "./storage";
import { authCallbackSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { getOAuth2Client } from "./gmail";

export function setupAuthRoutes(app: Express, storage: IStorage) {
  // Auth endpoints
  app.get("/api/auth/google-url", (req, res) => {
    try {
      const oauth2Client = getOAuth2Client();
      
      // Generate a random state to prevent CSRF
      const state = Math.random().toString(36).substring(2, 15);
      
      const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
      ];
      
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent", // Always show consent screen to get refresh_token
        state,
      });
      
      res.json({ url });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ message: "Failed to generate authentication URL" });
    }
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code } = authCallbackSchema.parse(req.query);
      
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      
      // Get user info with the access token
      oauth2Client.setCredentials(tokens);
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }
      
      const userInfo = await response.json();
      
      // Find existing user or create new one
      let user = await storage.getUserByGoogleId(userInfo.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        });
      } else {
        // Update existing user's tokens
        user = await storage.updateUserTokens(user.id, {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token || user.refreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.accessToken = tokens.access_token!;
      req.session.refreshToken = tokens.refresh_token || user.refreshToken!;
      req.session.tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date();
      
      // Redirect to frontend
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Auth callback error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Authentication failed" });
      }
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json({ isAuthenticated: false });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.json({ isAuthenticated: false });
      }
      
      res.json({
        isAuthenticated: true,
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user information" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
}
