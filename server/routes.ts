import type { Express } from "express";
import type { Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Start the Python Flask server for the downloader logic
  // We run it on port 5001 to avoid conflict with the main Node server on 5000
  console.log("Starting Python backend...");
  
  // Install flask first if needed (though we expect it to be installed via requirements or manual step)
  // For robustness in this environment, we'll assume 'pip install flask flask-cors' is run or available.
  // We'll try to run the python script.
  const pythonProcess = spawn('python3', ['server/app.py'], {
    stdio: 'inherit' // Pipe output to parent console for debugging
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python backend:', err);
  });
  
  // Proxy /play and /download to Python
  const proxy = createProxyMiddleware({
    target: 'http://127.0.0.1:5001',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(502).json({ status: false, error: "Backend service unavailable" });
    }
  });

  app.get('/play', proxy);
  app.get('/download', proxy);

  // Optional: History endpoint if we want to show recent plays
  app.get('/api/history', async (req, res) => {
    const history = await storage.getRecentDownloads();
    res.json(history);
  });

  return httpServer;
}
