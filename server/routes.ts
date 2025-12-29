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
        '--socket-timeout', '120',
        '-f', 'bestaudio/best',
        '--no-warnings',
        '--prefer-free-formats',
        '--add-header', 'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        url
      ];
      
      const process_info = spawn('yt-dlp', cmd.slice(1));
      let stdout = '';
      let stderr = '';

      const timeout = setTimeout(() => {
        process_info.kill();
        reject(new Error('Metadata extraction timed out'));
      }, 120000);

      process_info.on('error', (err) => {
        clearTimeout(timeout);
        console.error('yt-dlp info spawn error:', err);
        reject(err);
      });

      process_info.stdout.on('data', (data) => stdout += data);
      process_info.stderr.on('data', (data) => stderr += data);

      process_info.on('close', (code) => {
        clearTimeout(timeout);
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
      console.log("Audio downloading..");
      const videoData = await get_video_info(url);
      const title = videoData.title || 'audio';
      const asciiTitle = title.replace(/[^\x00-\x7F]/g, "").replace(/[^\w\s._-]/g, "").trim() || "audio";

      res.setHeader('Content-Disposition', `attachment; filename="${asciiTitle}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Transfer-Encoding', 'chunked');

      const ytArgs = [
        '--no-cache-dir',
        '--no-mtime',
        '--no-part',
        '--buffer-size', '16K',
        '-f', 'bestaudio/best',
        '-o', '-',
        '--socket-timeout', '60',
        '--no-playlist',
        '--no-warnings',
        '--prefer-free-formats',
        '--add-header', 'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        url
      ];

      console.log(`Starting yt-dlp process for: ${url}`);
      const ytProcess = spawn('yt-dlp', ytArgs);
      let bytesSent = 0;

      ytProcess.stdout.on('data', (chunk) => {
        if (!res.writableEnded) {
          res.write(chunk);
          bytesSent += chunk.length;
        }
      });

      ytProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.toLowerCase().includes('error')) {
          console.error(`yt-dlp download error: ${msg}`);
        }
      });

      ytProcess.on('close', (code) => {
        console.log(`yt-dlp process closed with code ${code}. Total bytes sent: ${bytesSent}`);
        if (code === 0 && bytesSent > 0) {
          console.log("Seucefully download..");
          console.log("Sent to api caller");
        } else if (!res.writableEnded) {
          console.error('Download failed or no data produced');
        }
        if (!res.writableEnded) res.end();
      });

      ytProcess.on('error', (err) => {
        console.error('yt-dlp process error:', err);
        if (!res.writableEnded) res.end();
      });

      res.on('close', () => {
        if (ytProcess && !ytProcess.killed) {
          ytProcess.kill('SIGTERM');
        }
      });
    } catch (error: any) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

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

  app.get('/api/history', async (req, res) => {
    const history = await storage.getRecentDownloads();
    res.json(history);
  });

  return httpServer;
}
