import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  googleId: text("google_id").unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for email analysis results
export const emailAnalysis = pgTable("email_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  totalEmails: integer("total_emails"),
  storageUsed: integer("storage_used"), // in bytes
  potentialCleanup: integer("potential_cleanup"), // in bytes
  tempCodeCount: integer("temp_code_count"),
  runDate: timestamp("run_date").defaultNow(),
});

// Schema for temporary code emails
export const tempCodeEmails = pgTable("temp_code_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  messageId: text("message_id").notNull(),
  threadId: text("thread_id"),
  from: text("from"),
  fromEmail: text("from_email"),
  subject: text("subject"),
  snippet: text("snippet"),
  receivedAt: timestamp("received_at"),
  detected: timestamp("detected").defaultNow(),
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAnalysisSchema = createInsertSchema(emailAnalysis).omit({
  id: true,
  runDate: true,
});

export const insertTempCodeEmailSchema = createInsertSchema(tempCodeEmails).omit({
  id: true,
  detected: true,
});

// Auth related schemas
export const authCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EmailAnalysis = typeof emailAnalysis.$inferSelect;
export type InsertEmailAnalysis = z.infer<typeof insertEmailAnalysisSchema>;
export type TempCodeEmail = typeof tempCodeEmails.$inferSelect;
export type InsertTempCodeEmail = z.infer<typeof insertTempCodeEmailSchema>;

// Response types for client
export type UserInfo = {
  id: number;
  email: string;
  name: string | null;
  isAuthenticated: boolean;
};

export type EmailStats = {
  totalEmails: number;
  storageUsed: number; // in bytes
  potentialCleanup: number; // in bytes
  tempCodeCount: number;
};

export type TempCodeEmailInfo = {
  id: number;
  messageId: string;
  threadId: string | null;
  from: string | null;
  fromEmail: string | null;
  subject: string | null;
  snippet: string | null;
  receivedAt: string | null;
};
