import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Download history table
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

// Track info schema for the search results
export const trackInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.string().optional(),
  author: z.string(),
  thumbnail: z.string(),
  url: z.string(),
});

export type TrackInfo = z.infer<typeof trackInfoSchema>;
