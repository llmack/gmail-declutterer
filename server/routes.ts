import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { setupAuthRoutes } from "./auth";
import { setupGmailRoutes } from "./gmail";

declare module "express-session" {
  interface SessionData {
    userId: number;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: Date;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "gmail-declutter-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      },
    })
  );

  // Auth middleware to protect routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Set up auth routes
  setupAuthRoutes(app, storage);

  // Set up Gmail API routes
  setupGmailRoutes(app, storage, requireAuth);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
