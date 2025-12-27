import os
import sys
import subprocess
import json
import logging
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Re-use the same downloader logic for both /play and /download
def get_video_info(url):
    try:
        # Get metadata and direct URL in one go if possible
        cmd = [
            'yt-dlp',
            '-J',
            '--no-playlist',
            '--flat-playlist',
            '--socket-timeout', '30',
            '-f', 'bestaudio/best',
            url
        ]
        process = subprocess.run(cmd, capture_output=True, text=True)
        if process.returncode != 0:
            return None, f"yt-dlp error: {process.stderr}"
        
        data = json.loads(process.stdout)
        return data, None
    except Exception as e:
        return None, str(e)

@app.route('/play', methods=['GET'])
def play():
    youtube_url = request.args.get('url')
    if not youtube_url:
        return jsonify({"status": False, "error": "URL is required"}), 400

    logger.info(f"Play: {youtube_url}")
    video_data, error = get_video_info(youtube_url)
    
    if error:
        return jsonify({"status": False, "error": error}), 400

    # Get the best audio URL from formats or the root
    audio_url = video_data.get('url')
    if not audio_url and 'formats' in video_data:
        # Filter for audio-only formats
        audio_formats = [f for f in video_data['formats'] if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
        if audio_formats:
            # Pick the best quality audio
            audio_url = sorted(audio_formats, key=lambda x: x.get('abr', 0) or 0, reverse=True)[0].get('url')

    if not audio_url:
        return jsonify({"status": False, "error": "Could not extract audio stream"}), 404

    return jsonify({
        "status": True,
        "title": video_data.get('title', 'Unknown Title'),
        "duration": video_data.get('duration', 0),
        "author": video_data.get('uploader', 'Unknown Artist'),
        "thumbnail": video_data.get('thumbnail', ''),
        "audio": audio_url,
        "id": video_data.get('id')
    })

@app.route('/download', methods=['GET'])
def download():
    youtube_url = request.args.get('url')
    if not youtube_url:
        return jsonify({"status": False, "error": "URL is required"}), 400

    logger.info(f"Download: {youtube_url}")
    video_data, error = get_video_info(youtube_url)
    
    if error:
        return jsonify({"status": False, "error": error}), 400

    audio_url = video_data.get('url')
    if not audio_url and 'formats' in video_data:
        audio_formats = [f for f in video_data['formats'] if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
        if audio_formats:
            audio_url = sorted(audio_formats, key=lambda x: x.get('abr', 0) or 0, reverse=True)[0].get('url')

    if not audio_url:
        return jsonify({"status": False, "error": "Could not get audio URL"}), 400

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        # Use a longer timeout and better error handling for the request
        req = requests.get(audio_url, stream=True, headers=headers, timeout=60)
        req.raise_for_status()
        
        def generate():
            for chunk in req.iter_content(chunk_size=1024 * 64):
                if chunk:
                    yield chunk

        title = video_data.get('title', 'audio')
        safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '.', '_')]).strip()
        if not safe_title:
            safe_title = "audio"
        
        # ASCII-only filename for Content-Disposition to avoid encoding errors
        ascii_title = safe_title.encode('ascii', 'ignore').decode('ascii') or "audio"

        return Response(
            stream_with_context(generate()),
            headers={
                "Content-Disposition": f"attachment; filename=\"{ascii_title}.mp3\"",
                "Content-Type": "audio/mpeg",
                "Content-Length": req.headers.get('Content-Length')
            }
        )
    except Exception as e:
        logger.exception("Download streaming error")
        return jsonify({"status": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
