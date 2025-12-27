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

@app.route('/play', methods=['GET'])
def play():
    youtube_url = request.args.get('url')
    
    if not youtube_url:
        return jsonify({"status": False, "error": "URL is required"}), 400

    logger.info(f"Processing URL for play: {youtube_url}")

    try:
        # Get metadata
        metadata_cmd = [
            'yt-dlp',
            '-J',
            '--no-playlist',
            '--flat-playlist',
            youtube_url
        ]

        process = subprocess.run(
            metadata_cmd,
            capture_output=True,
            text=True,
            check=False
        )

        if process.returncode != 0:
            logger.error(f"yt-dlp metadata error: {process.stderr}")
            return jsonify({"status": False, "error": "Failed to fetch video info."}), 400

        video_data = json.loads(process.stdout)
        
        # Get direct audio URL
        direct_url_cmd = [
            'yt-dlp',
            '-f', 'bestaudio',
            '-g',
            youtube_url
        ]
        
        url_process = subprocess.run(
            direct_url_cmd,
            capture_output=True,
            text=True,
            check=False
        )
        
        audio_url = url_process.stdout.strip() if url_process.returncode == 0 else video_data.get('url')
        
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

    except Exception as e:
        logger.exception("Unexpected error in /play")
        return jsonify({"status": False, "error": str(e)}), 500

@app.route('/download', methods=['GET'])
def download():
    youtube_url = request.args.get('url')
    if not youtube_url:
        return jsonify({"status": False, "error": "URL is required"}), 400

    logger.info(f"Processing URL for download: {youtube_url}")

    try:
        # Step 1: Get direct URL and title using -J for more reliability
        cmd = ['yt-dlp', '-J', '--no-playlist', '-f', 'bestaudio/best', youtube_url]
        process = subprocess.run(cmd, capture_output=True, text=True)
        if process.returncode != 0:
            logger.error(f"yt-dlp download error: {process.stderr}")
            return jsonify({"status": False, "error": "Extraction failed"}), 400
        
        video_data = json.loads(process.stdout)
        title = video_data.get('title', 'audio')
        audio_url = video_data.get('url')

        if not audio_url:
            # Try -g as fallback
            logger.info("Direct URL not in JSON, trying -g fallback")
            url_cmd = ['yt-dlp', '-f', 'bestaudio/best', '-g', youtube_url]
            url_process = subprocess.run(url_cmd, capture_output=True, text=True)
            if url_process.returncode == 0:
                audio_url = url_process.stdout.strip()

        if not audio_url:
            return jsonify({"status": False, "error": "Could not get audio URL"}), 400

        # Stream the file from YouTube to the client
        # User agents can help with some restrictions
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = requests.get(audio_url, stream=True, headers=headers, timeout=30)
        req.raise_for_status()
        
        def generate():
            for chunk in req.iter_content(chunk_size=65536): # Increased chunk size
                if chunk:
                    yield chunk

        # Sanitize filename
        safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '.', '_')]).strip()
        if not safe_title:
            safe_title = "audio"
        
        return Response(
            stream_with_context(generate()),
            headers={
                "Content-Disposition": f"attachment; filename=\"{safe_title}.mp3\"",
                "Content-Type": "audio/mpeg",
                "Content-Length": req.headers.get('Content-Length')
            }
        )
    except Exception as e:
        logger.exception("Unexpected error in /download")
        return jsonify({"status": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
