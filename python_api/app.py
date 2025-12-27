from flask import Flask, request, Response, stream_with_context
import subprocess
import requests
import re
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def get_audio_url(youtube_url):
    """
    Uses yt-dlp to extract the direct audio URL from a YouTube link.
    """
    try:
        # Command to get the best audio URL
        cmd = [
            'yt-dlp',
            '--no-check-certificate',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '-f', 'bestaudio/best',
            '--get-url',
            '--no-warnings',
            youtube_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
        url = result.stdout.strip()
        if not url:
            logger.error("yt-dlp returned empty output")
            return None
        return url
    except subprocess.TimeoutExpired:
        logger.error("yt-dlp extraction timed out")
        return None
    except subprocess.CalledProcessError as e:
        logger.error(f"yt-dlp error: {e.stderr}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in get_audio_url: {str(e)}")
        return None

@app.route('/')
def home():
    return {
        "message": "YouTube Audio API is running",
        "endpoints": {
            "/play": "/play?url=YOUTUBE_URL",
            "/download": "/download?url=YOUTUBE_URL"
        }
    }

@app.route('/play')
def play():
    """
    Endpoint: /play?url=YOUTUBE_URL
    Streams audio directly to the user in chunks.
    """
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing 'url' parameter."}, 400

    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$', video_url):
        return {"error": "Invalid YouTube URL format"}, 400

    logger.info(f"Extracting audio URL for: {video_url}")
    direct_url = get_audio_url(video_url)
    
    if not direct_url:
        return {"error": "Failed to extract direct audio URL."}, 500

    try:
        headers_to_use = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
        req = requests.get(direct_url, stream=True, timeout=15, headers=headers_to_use)
        req.raise_for_status()
        
        def generate():
            for chunk in req.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        headers = {
            'Content-Type': req.headers.get('Content-Type', 'audio/mpeg'),
            'Content-Length': req.headers.get('Content-Length'),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")
        return {"error": "An internal error occurred during streaming"}, 500

@app.route('/download')
def download():
    """
    Endpoint: /download?url=YOUTUBE_URL
    Forces a download of the audio file.
    """
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing 'url' parameter."}, 400

    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$', video_url):
        return {"error": "Invalid YouTube URL format"}, 400

    direct_url = get_audio_url(video_url)
    if not direct_url:
        return {"error": "Failed to extract direct audio URL."}, 500

    try:
        headers_to_use = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
        req = requests.get(direct_url, stream=True, timeout=15, headers=headers_to_use)
        req.raise_for_status()

        def generate():
            for chunk in req.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        # Extract filename or use default
        filename = "audio.mp3"
        
        headers = {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Length': req.headers.get('Content-Length'),
            'Cache-Control': 'no-cache'
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return {"error": "An internal error occurred during download"}, 500

if __name__ == '__main__':
    # Force port 5001 for local development to avoid conflict with Node (5000)
    # Only use PORT env var if it's not 5000, or if we are in production
    port = int(os.environ.get('PORT', 5001))
    if port == 5000:
        port = 5001
    print(f"Python Audio API is starting on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, threaded=True)
