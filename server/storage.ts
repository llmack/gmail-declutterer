import { 
  users, 
  type User, 
  type InsertUser, 
  type EmailAnalysis, 
  type InsertEmailAnalysis,
  type TempCodeEmail,
  type InsertTempCodeEmail
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, tokens: { 
    accessToken: string, 
    refreshToken?: string, 
    tokenExpiry?: Date 
  }): Promise<User>;
  
  // Email analysis methods
  createEmailAnalysis(analysis: InsertEmailAnalysis): Promise<EmailAnalysis>;
  getLatestEmailAnalysis(userId: number): Promise<EmailAnalysis | undefined>;
  
  // Temporary code emails methods
  createTempCodeEmail(email: InsertTempCodeEmail): Promise<TempCodeEmail>;
  getTempCodeEmailsByUser(userId: number): Promise<TempCodeEmail[]>;
  deleteTempCodeEmails(userId: number, messageIds: string[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailAnalysis: Map<number, EmailAnalysis>;
  private tempCodeEmails: Map<number, TempCodeEmail>;
  currentId: number;
  currentAnalysisId: number;
  currentEmailId: number;

  constructor() {
    this.users = new Map();
    this.emailAnalysis = new Map();
    this.tempCodeEmails = new Map();
    this.currentId = 1;
    this.currentAnalysisId = 1;
    this.currentEmailId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      googleId: insertUser.googleId || null,
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null,
      tokenExpiry: insertUser.tokenExpiry || null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(
    id: number, 
    tokens: { 
      accessToken: string, 
      refreshToken?: string, 
      tokenExpiry?: Date 
    }
  ): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = {
      ...user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || user.refreshToken,
      tokenExpiry: tokens.tokenExpiry || user.tokenExpiry
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createEmailAnalysis(
    analysis: InsertEmailAnalysis
  ): Promise<EmailAnalysis> {
    const id = this.currentAnalysisId++;
    const now = new Date();
    const emailAnalysis: EmailAnalysis = {
      ...analysis,
      id,
      runDate: now
    };
    
    this.emailAnalysis.set(id, emailAnalysis);
    return emailAnalysis;
  }

  async getLatestEmailAnalysis(
    userId: number
  ): Promise<EmailAnalysis | undefined> {
    const userAnalyses = Array.from(this.emailAnalysis.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.runDate.getTime() - a.runDate.getTime());
    
    return userAnalyses[0];
  }

  async createTempCodeEmail(
    email: InsertTempCodeEmail
  ): Promise<TempCodeEmail> {
    const id = this.currentEmailId++;
    const now = new Date();
    const tempEmail: TempCodeEmail = {
      ...email,
      id,
      threadId: email.threadId || null,
      from: email.from || null,
      fromEmail: email.fromEmail || null,
      subject: email.subject || null,
      snippet: email.snippet || null,
      receivedAt: email.receivedAt || null,
      detected: now
    };
    
    this.tempCodeEmails.set(id, tempEmail);
    return tempEmail;
  }

  async getTempCodeEmailsByUser(userId: number): Promise<TempCodeEmail[]> {
    return Array.from(this.tempCodeEmails.values())
      .filter(email => email.userId === userId)
      .sort((a, b) => {
        if (a.receivedAt && b.receivedAt) {
          return b.receivedAt.getTime() - a.receivedAt.getTime();
        }
        return 0;
      });
  }

  async deleteTempCodeEmails(
    userId: number, 
    messageIds: string[]
  ): Promise<void> {
    const emailsToDelete = Array.from(this.tempCodeEmails.entries())
      .filter(([, email]) => 
        email.userId === userId && messageIds.includes(email.messageId)
      );
    
    for (const [id] of emailsToDelete) {
      this.tempCodeEmails.delete(id);
    }
  }
}

export const storage = new MemStorage();
