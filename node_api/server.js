const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const port = 5002;

/**
 * Uses yt-dlp to extract the direct audio URL.
 */
async function getAudioUrl(youtubeUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '--get-url',
      '--no-warnings',
      youtubeUrl
    ]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`yt-dlp failed with code ${code}: ${errorOutput}`));
      }
    });
  });
}

app.get('/play', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Basic URL validation
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!ytRegex.test(videoUrl)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const directUrl = await getAudioUrl(videoUrl);

    // Stream the audio from the direct URL to the client
    const response = await axios({
      method: 'get',
      url: directUrl,
      responseType: 'stream',
      timeout: 10000
    });

    // Set headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    res.setHeader('Accept-Ranges', 'bytes');

    // Pipe the stream directly to the response
    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to stream audio', details: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`NodeJS Audio API listening at http://0.0.0.0:${port}`);
});
