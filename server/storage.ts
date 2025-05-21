import { users, type User, type InsertUser, emailAnalytics, emailCategories, deletionHistory, type EmailAnalytics, type InsertEmailAnalytics, type EmailCategory, type InsertEmailCategory, type DeletionHistory, type InsertDeletionHistory } from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, accessToken: string, refreshToken: string, tokenExpiry: Date): Promise<User | undefined>;
  
  // Email analytics methods
  getEmailAnalytics(userId: number): Promise<EmailAnalytics | undefined>;
  createEmailAnalytics(analytics: InsertEmailAnalytics): Promise<EmailAnalytics>;
  updateEmailAnalytics(userId: number, analytics: Partial<InsertEmailAnalytics>): Promise<EmailAnalytics | undefined>;
  
  // Email categories methods
  getEmailCategories(userId: number): Promise<EmailCategory[]>;
  getEmailCategoryByType(userId: number, categoryType: string): Promise<EmailCategory | undefined>;
  createEmailCategory(category: InsertEmailCategory): Promise<EmailCategory>;
  updateEmailCategory(id: number, category: Partial<InsertEmailCategory>): Promise<EmailCategory | undefined>;
  
  // Deletion history methods
  getDeletionHistory(userId: number): Promise<DeletionHistory[]>;
  createDeletionHistory(history: InsertDeletionHistory): Promise<DeletionHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailAnalytics: Map<number, EmailAnalytics>;
  private emailCategories: Map<number, EmailCategory>;
  private deletionHistory: Map<number, DeletionHistory>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.emailAnalytics = new Map();
    this.emailCategories = new Map();
    this.deletionHistory = new Map();
    this.currentId = {
      users: 1,
      emailAnalytics: 1,
      emailCategories: 1,
      deletionHistory: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      name: insertUser.name || null,
      picture: insertUser.picture || null,
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null,
      tokenExpiry: insertUser.tokenExpiry || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(id: number, accessToken: string, refreshToken: string, tokenExpiry: Date): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      accessToken,
      refreshToken,
      tokenExpiry
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Email analytics methods
  async getEmailAnalytics(userId: number): Promise<EmailAnalytics | undefined> {
    return Array.from(this.emailAnalytics.values()).find(
      (analytics) => analytics.userId === userId,
    );
  }

  async createEmailAnalytics(analytics: InsertEmailAnalytics): Promise<EmailAnalytics> {
    const id = this.currentId.emailAnalytics++;
    const emailAnalytic: EmailAnalytics = { 
      ...analytics, 
      id, 
      lastAnalyzed: new Date(),
      totalEmails: analytics.totalEmails || null,
      storageUsed: analytics.storageUsed || null,
      declutterPotential: analytics.declutterPotential || null
    };
    this.emailAnalytics.set(id, emailAnalytic);
    return emailAnalytic;
  }

  async updateEmailAnalytics(userId: number, analytics: Partial<InsertEmailAnalytics>): Promise<EmailAnalytics | undefined> {
    const existingAnalytics = await this.getEmailAnalytics(userId);
    if (!existingAnalytics) return undefined;
    
    const updatedAnalytics: EmailAnalytics = {
      ...existingAnalytics,
      ...analytics,
      lastAnalyzed: new Date()
    };
    
    this.emailAnalytics.set(existingAnalytics.id, updatedAnalytics);
    return updatedAnalytics;
  }

  // Email categories methods
  async getEmailCategories(userId: number): Promise<EmailCategory[]> {
    return Array.from(this.emailCategories.values()).filter(
      (category) => category.userId === userId,
    );
  }

  async getEmailCategoryByType(userId: number, categoryType: string): Promise<EmailCategory | undefined> {
    return Array.from(this.emailCategories.values()).find(
      (category) => category.userId === userId && category.categoryType === categoryType,
    );
  }

  async createEmailCategory(category: InsertEmailCategory): Promise<EmailCategory> {
    const id = this.currentId.emailCategories++;
    const emailCategory: EmailCategory = { 
      ...category, 
      id, 
      lastUpdated: new Date(),
      count: category.count || null,
      sampleEmails: category.sampleEmails || null
    };
    this.emailCategories.set(id, emailCategory);
    return emailCategory;
  }

  async updateEmailCategory(id: number, category: Partial<InsertEmailCategory>): Promise<EmailCategory | undefined> {
    const existingCategory = this.emailCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: EmailCategory = {
      ...existingCategory,
      ...category,
      lastUpdated: new Date()
    };
    
    this.emailCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Deletion history methods
  async getDeletionHistory(userId: number): Promise<DeletionHistory[]> {
    return Array.from(this.deletionHistory.values()).filter(
      (history) => history.userId === userId,
    );
  }

  async createDeletionHistory(history: InsertDeletionHistory): Promise<DeletionHistory> {
    const id = this.currentId.deletionHistory++;
    const deletionHistoryEntry: DeletionHistory = { 
      ...history, 
      id, 
      deletedAt: new Date(),
      emailIds: history.emailIds || null
    };
    this.deletionHistory.set(id, deletionHistoryEntry);
    return deletionHistoryEntry;
  }
}

export const storage = new MemStorage();
