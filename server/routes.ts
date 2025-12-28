import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import ytdl from "@distube/ytdl-core";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get('/play', async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "URL is required" });

    try {
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      
      res.json({
        status: true,
        title: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds),
        author: info.videoDetails.author.name,
        thumbnail: info.videoDetails.thumbnails[0].url,
        audio: format.url,
        id: info.videoDetails.videoId
      });
    } catch (error: any) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  app.get('/download', async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "URL is required" });

    try {
      console.log("Audio downloading..");
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const asciiTitle = title.replace(/[^\x00-\x7F]/g, "").replace(/[^\w\s._-]/g, "").trim() || "audio";

      res.setHeader('Content-Disposition', `attachment; filename="${asciiTitle}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');

      const stream = ytdl(url, {
        quality: 'highestaudio',
        filter: 'audioonly',
      });

      stream.pipe(res);

      stream.on('end', () => {
        console.log("Seucefully download..");
        console.log("Sent to api caller");
      });

      stream.on('error', (err) => {
        console.error('[Download] Error:', err);
        if (!res.headersSent) {
          res.status(500).json({ status: false, error: "Download failed" });
        }
      });

      res.on('close', () => {
        stream.destroy();
      });
    } catch (error: any) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  // Health check/Root endpoint
  app.get('/', (req, res) => {
    res.json({
      status: "online",
      message: "YouTube Audio API is running",
      endpoints: {
        play: "/play?url=<YOUTUBE_URL>",
        download: "/download?url=<YOUTUBE_URL>",
        history: "/api/history"
      }
    });
  });

  // Optional: History endpoint if we want to show recent plays
  app.get('/api/history', async (req, res) => {
    const history = await storage.getRecentDownloads();
    res.json(history);
  });

  return httpServer;
}
