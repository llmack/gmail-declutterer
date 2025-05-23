import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  picture: text("picture"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailAnalytics = pgTable("email_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalEmails: integer("total_emails"),
  storageUsed: text("storage_used"),
  declutterPotential: integer("declutter_potential"),
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
});

export const emailCategories = pgTable("email_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryType: text("category_type").notNull(), // 'temporary_code', 'subscription', 'promotion', 'news'
  count: integer("count").default(0),
  sampleEmails: jsonb("sample_emails"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const deletionHistory = pgTable("deletion_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryType: text("category_type").notNull(),
  count: integer("count").notNull(),
  emailIds: text("email_ids").array(),
  senderEmail: text("sender_email").default("unknown"),
  senderName: text("sender_name").default("unknown"),
  deletedAt: timestamp("deleted_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAnalyticsSchema = createInsertSchema(emailAnalytics).omit({
  id: true,
  lastAnalyzed: true,
});

export const insertEmailCategorySchema = createInsertSchema(emailCategories).omit({
  id: true,
  lastUpdated: true,
});

export const insertDeletionHistorySchema = createInsertSchema(deletionHistory).omit({
  id: true,
  deletedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmailAnalytics = z.infer<typeof insertEmailAnalyticsSchema>;
export type EmailAnalytics = typeof emailAnalytics.$inferSelect;

export type InsertEmailCategory = z.infer<typeof insertEmailCategorySchema>;
export type EmailCategory = typeof emailCategories.$inferSelect;

export type InsertDeletionHistory = z.infer<typeof insertDeletionHistorySchema>;
export type DeletionHistory = typeof deletionHistory.$inferSelect;

// Email schema types
export const emailSchema = z.object({
  id: z.string(),
  sender: z.string(),
  subject: z.string(),
  snippet: z.string().optional(),
  date: z.string(),
  labelIds: z.array(z.string()).optional(),
  sizeEstimate: z.number().optional(),
});

export type Email = z.infer<typeof emailSchema>;

export const temporaryCodeEmailSchema = emailSchema.extend({
  codeType: z.enum(['verification', 'otp', 'security']),
  code: z.string().optional(),
  isExpired: z.boolean().optional(),
  daysAgo: z.number(),
});

export type TemporaryCodeEmail = z.infer<typeof temporaryCodeEmailSchema>;
