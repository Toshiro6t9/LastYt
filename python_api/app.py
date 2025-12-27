from flask import Flask, request, Response, stream_with_context
import subprocess
import requests
import re
import logging

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
        # --get-url returns only the URL
        # -f bestaudio ensures we get the audio stream
        cmd = [
            'yt-dlp',
            '-f', 'bestaudio/best',
            '--get-url',
            '--no-warnings',
            '--extract-audio',
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

@app.route('/play')
def play():
    """
    Endpoint: /play?url=YOUTUBE_URL
    Streams audio directly to the user in chunks.
    """
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing 'url' parameter. Example: /play?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"}, 400

    # Basic YouTube URL validation
    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$', video_url):
        return {"error": "Invalid YouTube URL format"}, 400

    logger.info(f"Extracting audio URL for: {video_url}")
    direct_url = get_audio_url(video_url)
    
    if not direct_url:
        return {"error": "Failed to extract direct audio URL. The video might be restricted or unavailable."}, 500

    try:
        # Use a common browser User-Agent to bypass some YouTube/CDN restrictions
        headers_to_use = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
        req = requests.get(direct_url, stream=True, timeout=15, headers=headers_to_use)
        req.raise_for_status()
        
        def generate():
            # Chunked reading for memory safety (4KB chunks)
            for chunk in req.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        # Proxy essential headers for better compatibility with players
        headers = {
            'Content-Type': req.headers.get('Content-Type', 'audio/mpeg'),
            'Content-Length': req.headers.get('Content-Length'),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache'
        }

        logger.info(f"Streaming started for: {video_url}")
        return Response(stream_with_context(generate()), headers=headers)

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error while streaming: {str(e)}")
        return {"error": "Failed to connect to audio source"}, 502
    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")
        return {"error": "An internal error occurred during streaming"}, 500

if __name__ == '__main__':
    # Running on port 5001 to avoid conflict with default Replit frontend (5000)
    print("Python Audio API is starting on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, threaded=True)
