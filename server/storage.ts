import { 
  type User, type InsertUser, type HeadshotLog, type InsertHeadshotLog,
  type AnalyticsLog, type InsertAnalyticsLog,
  type DownloadLog, type InsertDownloadLog,
  type EvalResult, type InsertEvalResult,
  analyticsLogs, downloadLogs, evalResults
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { desc, sql, gte, and, eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  logHeadshotCreation(): Promise<HeadshotLog>;
  getHeadshotCount(): Promise<number>;
  logAnalytics(data: InsertAnalyticsLog): Promise<AnalyticsLog>;
  logDownload(analyticsLogId: string): Promise<DownloadLog>;
  getAnalyticsStats(): Promise<{
    totalTransformations: number;
    successfulTransformations: number;
    totalDownloads: number;
    avgProcessingTimeMs: number;
    flashCount: number;
    proCount: number;
    todayTransformations: number;
    weekTransformations: number;
  }>;
  saveEvalResult(data: InsertEvalResult): Promise<EvalResult>;
  getEvalResults(runId?: string): Promise<EvalResult[]>;
  getLatestEvalRunId(): Promise<string | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private headshotLogs: HeadshotLog[];

  constructor() {
    this.users = new Map();
    this.headshotLogs = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async logHeadshotCreation(): Promise<HeadshotLog> {
    const log: HeadshotLog = {
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.headshotLogs.push(log);
    return log;
  }

  async getHeadshotCount(): Promise<number> {
    return this.headshotLogs.length;
  }

  async logAnalytics(data: InsertAnalyticsLog): Promise<AnalyticsLog> {
    const [result] = await db.insert(analyticsLogs).values(data).returning();
    return result;
  }

  async logDownload(analyticsLogId: string): Promise<DownloadLog> {
    const [result] = await db.insert(downloadLogs).values({ analyticsLogId }).returning();
    return result;
  }

  async getAnalyticsStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const allLogs = await db.select().from(analyticsLogs);
    const allDownloads = await db.select().from(downloadLogs);

    const successfulLogs = allLogs.filter(l => l.success);
    const flashLogs = allLogs.filter(l => l.modelUsed === 'flash');
    const proLogs = allLogs.filter(l => l.modelUsed === 'pro');
    const todayLogs = allLogs.filter(l => l.createdAt >= todayStart);
    const weekLogs = allLogs.filter(l => l.createdAt >= weekStart);

    const processingTimes = successfulLogs
      .map(l => l.processingTimeMs)
      .filter((t): t is number => t !== null);
    
    const avgProcessingTimeMs = processingTimes.length > 0
      ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
      : 0;

    return {
      totalTransformations: allLogs.length,
      successfulTransformations: successfulLogs.length,
      totalDownloads: allDownloads.length,
      avgProcessingTimeMs,
      flashCount: flashLogs.length,
      proCount: proLogs.length,
      todayTransformations: todayLogs.length,
      weekTransformations: weekLogs.length,
    };
  }

  async saveEvalResult(data: InsertEvalResult): Promise<EvalResult> {
    const [result] = await db.insert(evalResults).values(data).returning();
    return result;
  }

  async getEvalResults(runId?: string): Promise<EvalResult[]> {
    if (runId) {
      return db.select().from(evalResults).where(eq(evalResults.runId, runId)).orderBy(desc(evalResults.createdAt));
    }
    return db.select().from(evalResults).orderBy(desc(evalResults.createdAt));
  }

  async getLatestEvalRunId(): Promise<string | null> {
    const [latest] = await db.select({ runId: evalResults.runId })
      .from(evalResults)
      .orderBy(desc(evalResults.createdAt))
      .limit(1);
    return latest?.runId ?? null;
  }
}

export const storage = new MemStorage();
