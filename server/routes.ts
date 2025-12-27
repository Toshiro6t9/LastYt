import type { Express } from "express";
import type { Server } from "http";
import { spawn } from "child_process";
import axios from "axios";

/**
 * Uses yt-dlp to extract the direct audio URL.
 */
async function getAudioUrl(youtubeUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', [
      '--no-check-certificate',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '-f', 'bestaudio/best',
      '--get-url',
      '--no-warnings',
      youtubeUrl
    ]);

    let output = '';
    let errorOutput = '';

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('URL extraction timed out'));
    }, 30000);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        reject(new Error(`yt-dlp failed (code ${code}): ${errorOutput.trim() || 'Unknown error'}`));
      }
    });
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Streaming endpoint
  app.get('/api/audio/play', async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) return res.status(400).json({ error: 'Missing URL parameter' });

    try {
      const directUrl = await getAudioUrl(videoUrl);
      const response = await axios({
        method: 'get',
        url: directUrl,
        responseType: 'stream',
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });

      res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');
      
      response.data.pipe(res);

      req.on('close', () => {
        response.data.destroy();
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download endpoint
  app.get('/api/audio/download', async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) return res.status(400).json({ error: 'Missing URL parameter' });

    try {
      const directUrl = await getAudioUrl(videoUrl);
      const response = await axios({
        method: 'get',
        url: directUrl,
        responseType: 'stream',
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      res.setHeader('Cache-Control', 'no-cache');
      
      response.data.pipe(res);

      req.on('close', () => {
        response.data.destroy();
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const portPlaceholder = 5000; // not used since index.ts creates the server
  return httpServer;
}
