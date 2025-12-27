const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const port = 5002;

/**
 * Uses yt-dlp to extract the direct audio URL.
 * yt-dlp is powerful and regularly updated to bypass blocks.
 */
async function getAudioUrl(youtubeUrl) {
  return new Promise((resolve, reject) => {
    // -f bestaudio: Get the best audio-only stream
    // --get-url: Output only the resulting URL
    const child = spawn('yt-dlp', [
      '-f', 'bestaudio/best',
      '--get-url',
      '--no-warnings',
      youtubeUrl
    ]);

    let output = '';
    let errorOutput = '';

    // Set a timeout for extraction
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

/**
 * Endpoint: /play?url=YOUTUBE_URL
 */
app.get('/play', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ 
      error: 'Missing URL parameter', 
      example: '/play?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
    });
  }

  // Basic validation to prevent arbitrary shell/network usage
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!ytRegex.test(videoUrl)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    console.log(`Extracting audio URL for: ${videoUrl}`);
    const directUrl = await getAudioUrl(videoUrl);

    // Fetch the stream from the direct URL
    // responseType: 'stream' ensures memory safety for large files
    const response = await axios({
      method: 'get',
      url: directUrl,
      responseType: 'stream',
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });

    // Pass through relevant headers to help players identify the stream
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');

    console.log(`Streaming started for: ${videoUrl}`);
    
    // Pipe the external stream directly to our client response
    response.data.pipe(res);

    // Handle stream errors
    response.data.on('error', (err) => {
      console.error('Stream piping error:', err);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Upstream connection lost' });
      } else {
        res.end();
      }
    });

    // Stop streaming if client disconnects
    req.on('close', () => {
      console.log('Client disconnected, stopping stream.');
      response.data.destroy();
    });

  } catch (error) {
    console.error('API Error:', error.message);
    const status = error.message.includes('code 403') ? 403 : 500;
    res.status(status).json({ 
      error: 'Failed to stream audio', 
      details: error.message 
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`NodeJS Audio API listening at http://0.0.0.0:${port}`);
});
