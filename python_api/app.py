from flask import Flask, request, Response, stream_with_context
import subprocess
import requests
import re
import logging

# Configure logging to track API usage and errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def get_audio_url(youtube_url):
    """
    Uses yt-dlp to extract the direct audio URL from a YouTube link.
    Bypasses signature/throttling using common browser user-agents.
    """
    try:
        # Command to get the best audio URL directly from YouTube's CDN
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
            logger.error("yt-dlp extraction failed: empty output")
            return None
        return url
    except subprocess.TimeoutExpired:
        logger.error("yt-dlp extraction timed out (30s limit)")
        return None
    except subprocess.CalledProcessError as e:
        logger.error(f"yt-dlp error: {e.stderr}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in get_audio_url: {str(e)}")
        return None

@app.route('/play')
def play():
    """
    Endpoint: /play?url=<YOUTUBE_URL>
    Streams audio directly to the user in 4KB chunks for memory efficiency.
    Compatible with Discord/Messenger bots and HTML5 players.
    """
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing 'url' parameter. Usage: /play?url=YOUTUBE_URL"}, 400

    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$', video_url):
        return {"error": "Invalid YouTube URL format"}, 400

    logger.info(f"Extracting stream URL for: {video_url}")
    direct_url = get_audio_url(video_url)
    
    if not direct_url:
        return {"error": "Failed to extract direct audio URL. Video might be restricted."}, 500

    try:
        # Request stream from YouTube CDN with browser headers
        headers_to_use = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
        req = requests.get(direct_url, stream=True, timeout=15, headers=headers_to_use)
        req.raise_for_status()
        
        def generate():
            # Memory-safe chunked reading
            for chunk in req.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        # Proxy essential headers to ensure player compatibility
        headers = {
            'Content-Type': req.headers.get('Content-Type', 'audio/mpeg'),
            'Content-Length': req.headers.get('Content-Length'),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache'
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        logger.error(f"Streaming failed: {str(e)}")
        return {"error": "Upstream connection error during streaming"}, 502

@app.route('/download')
def download():
    """
    Endpoint: /download?url=<YOUTUBE_URL>
    Identical to /play but forces browser 'Save As' dialog.
    """
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing 'url' parameter"}, 400

    direct_url = get_audio_url(video_url)
    if not direct_url:
        return {"error": "Extraction failed"}, 500

    try:
        req = requests.get(direct_url, stream=True, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        req.raise_for_status()

        def generate():
            for chunk in req.iter_content(chunk_size=4096):
                yield chunk

        # Force attachment header
        headers = {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'attachment; filename="audio.mp3"',
            'Content-Length': req.headers.get('Content-Length'),
            'Cache-Control': 'no-cache'
        }

        return Response(stream_with_context(generate()), headers=headers)
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    # Updated to port 10527
    app.run(host='0.0.0.0', port=10527, threaded=True)
