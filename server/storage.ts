import { type User, type InsertUser, type HeadshotLog, type InsertHeadshotLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  logHeadshotCreation(): Promise<HeadshotLog>;
  getHeadshotCount(): Promise<number>;
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
}

export const storage = new MemStorage();
