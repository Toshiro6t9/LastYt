import { type Download, type InsertDownload, downloads } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getRecentDownloads(): Promise<Download[]>;
  addDownload(download: InsertDownload): Promise<Download>;
}

export class DatabaseStorage implements IStorage {
  async getRecentDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).orderBy(desc(downloads.playedAt)).limit(10);
  }

  async addDownload(insertDownload: InsertDownload): Promise<Download> {
    const [download] = await db.insert(downloads).values(insertDownload).returning();
    return download;
  }
}

export const storage = new DatabaseStorage();
