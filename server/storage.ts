import { type Download, type InsertDownload } from "@shared/schema";

export interface IStorage {
  getRecentDownloads(): Promise<Download[]>;
  addDownload(download: InsertDownload): Promise<Download>;
}

export class MemStorage implements IStorage {
  private downloads: Map<number, Download>;
  private nextId: number;

  constructor() {
    this.downloads = new Map();
    this.nextId = 1;
  }

  async getRecentDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values())
      .sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0))
      .slice(0, 10);
  }

  async addDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = this.nextId++;
    const download: Download = { 
      ...insertDownload, 
      id, 
      playedAt: insertDownload.playedAt || Math.floor(Date.now() / 1000)
    };
    this.downloads.set(id, download);
    return download;
  }
}

export const storage = new MemStorage();
