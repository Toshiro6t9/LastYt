from flask import Flask, request, Response, stream_with_context
import subprocess
import requests
import json
import re

app = Flask(__name__)

def get_audio_url(youtube_url):
    """
    Uses yt-dlp to extract the direct audio URL from a YouTube link.
    """
    try:
        # Command to get the best audio URL in JSON format
        cmd = [
            'yt-dlp',
            '-f', 'bestaudio',
            '--get-url',
            '--no-warnings',
            youtube_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error extracting URL: {e.stderr}")
        return None

@app.route('/play')
def play():
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "Missing URL parameter"}, 400

    # Basic URL validation
    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$', video_url):
        return {"error": "Invalid YouTube URL"}, 400

    direct_url = get_audio_url(video_url)
    if not direct_url:
        return {"error": "Failed to extract audio URL"}, 500

    try:
        # Stream the audio from the direct URL to the client
        req = requests.get(direct_url, stream=True, timeout=10)
        
        def generate():
            for chunk in req.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        # Pass through relevant headers
        headers = {
            'Content-Type': req.headers.get('Content-Type', 'audio/mpeg'),
            'Content-Length': req.headers.get('Content-Length'),
            'Accept-Ranges': 'bytes'
        }

        return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        return {"error": f"Streaming failed: {str(e)}"}, 500

if __name__ == '__main__':
    # Production-ready Flask apps usually run with gunicorn, 
    # but for this example we use the built-in server.
    app.run(host='0.0.0.0', port=5001)
