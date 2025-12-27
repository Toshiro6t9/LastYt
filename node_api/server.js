const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5002;

async function getAudioUrl(youtubeUrl) {
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

// Home endpoint
app.get('/', (req, res) => {
  res.json({
    message: "NodeJS Audio API is running",
    endpoints: {
      "/play": "/play?url=YOUTUBE_URL",
      "/download": "/download?url=YOUTUBE_URL"
    }
  });
});

// Streaming endpoint
app.get('/play', async (req, res) => {
  const videoUrl = req.query.url;
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
    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
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
    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`NodeJS Audio API listening at http://0.0.0.0:${port}`);
});
