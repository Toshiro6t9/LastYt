import type { Express } from "express";
import type { Server } from "http";
import { spawn } from "child_process";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const get_video_info = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cmd = [
        'yt-dlp',
        '-J',
        '--no-playlist',
        '--flat-playlist',
        '--socket-timeout', '60',
        '-f', 'bestaudio/best',
        url
      ];
      const process = spawn('yt-dlp', cmd.slice(1));
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => stdout += data);
      process.stderr.on('data', (data) => stderr += data);

      process.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`yt-dlp error: ${stderr}`));
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  app.get('/play', async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "URL is required" });

    try {
      const videoData = await get_video_info(url);
      let audioUrl = videoData.url;
      
      if (!audioUrl && videoData.formats) {
        const audioFormats = videoData.formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
        if (audioFormats.length > 0) {
          audioUrl = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0].url;
        }
      }

      if (!audioUrl) throw new Error("Could not extract audio stream");

      res.json({
        status: true,
        title: videoData.title || 'Unknown Title',
        duration: videoData.duration || 0,
        author: videoData.uploader || 'Unknown Artist',
        thumbnail: videoData.thumbnail || '',
        audio: audioUrl,
        id: videoData.id
      });
    } catch (error: any) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  app.get('/download', async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ status: false, error: "URL is required" });

    try {
      const videoData = await get_video_info(url);
      let audioUrl = videoData.url;
      
      if (!audioUrl && videoData.formats) {
        const audioFormats = videoData.formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
        if (audioFormats.length > 0) {
          audioUrl = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0].url;
        }
      }

      if (!audioUrl) throw new Error("Could not get audio URL");

      const title = videoData.title || 'audio';
      const asciiTitle = title.replace(/[^\x00-\x7F]/g, "").replace(/[^\w\s._-]/g, "").trim() || "audio";

      res.setHeader('Content-Disposition', `attachment; filename="${asciiTitle}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');

      const ytProcess = spawn('yt-dlp', [
        '-o', '-',
        '-f', 'bestaudio/best',
        '--socket-timeout', '60',
        url
      ]);

      // Use a more robust piping with error handling
      ytProcess.stdout.pipe(res);
      
      ytProcess.on('error', (err) => {
        console.error('yt-dlp spawn error:', err);
        if (!res.headersSent) {
          res.status(500).json({ status: false, error: "Failed to start downloader" });
        }
      });

      ytProcess.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('ERROR')) {
          console.error(`yt-dlp error: ${message}`);
        }
      });

      res.on('close', () => {
        if (ytProcess) ytProcess.kill();
      });

      ytProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
          res.status(500).json({ status: false, error: "Downloader exited with error" });
        }
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
