import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't strictly need a DB for the downloader, but we'll define a history table
// to show recently played/downloaded tracks (optional feature)
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  artist: text("artist"),
  thumbnail: text("thumbnail"),
  playedAt: integer("played_at").notNull(), // Unix timestamp
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  title: true,
  artist: true,
  thumbnail: true,
  playedAt: true
});

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

// API Response type matching the user requirement
export const trackInfoSchema = z.object({
  status: z.boolean(),
  title: z.string(),
  duration: z.number().nullable().optional(),
  author: z.string(),
  thumbnail: z.string(),
  audio: z.string(),
});

export type TrackInfo = z.infer<typeof trackInfoSchema>;
