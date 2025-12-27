import os
import sys
import subprocess
import json
import logging

# Check if flask is installed, if not try to install it (backup plan)
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
    from flask import Flask, request, jsonify
    from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/play', methods=['GET'])
def play():
    youtube_url = request.args.get('url')
    
    if not youtube_url:
        return jsonify({"status": False, "error": "URL is required"}), 400

    logger.info(f"Processing URL: {youtube_url}")

    try:
        # Command to get JSON metadata directly from yt-dlp
        # -J: dump json
        # --no-playlist: ensure we only get one video
        # -f bestaudio: get best audio quality
        cmd = [
            'yt-dlp',
            '-J',
            '--no-playlist',
            '-f', 'bestaudio',
            youtube_url
        ]

        # Execute yt-dlp via subprocess
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False
        )

        if process.returncode != 0:
            error_msg = process.stderr
            logger.error(f"yt-dlp error: {error_msg}")
            return jsonify({"status": False, "error": "Failed to fetch video info. Check URL or try again."}), 400

        # Parse the JSON output from yt-dlp
        video_data = json.loads(process.stdout)
        
        # Extract required fields
        title = video_data.get('title', 'Unknown Title')
        duration = video_data.get('duration', 0)
        uploader = video_data.get('uploader', 'Unknown Artist')
        thumbnail = video_data.get('thumbnail', '')
        
        # Get the direct audio URL
        # yt-dlp JSON output usually has 'url' field for the direct stream in the root 
        # or we look into 'formats' if needed, but -f bestaudio usually selects one.
        audio_url = video_data.get('url')
        
        if not audio_url:
            return jsonify({"status": False, "error": "Could not extract audio stream"}), 404

        response_data = {
            "status": True,
            "title": title,
            "duration": duration,
            "author": uploader,
            "thumbnail": thumbnail,
            "audio": audio_url
        }
        
        return jsonify(response_data)

    except Exception as e:
        logger.exception("Unexpected error")
        return jsonify({"status": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to distinguish from the main Node server (5000)
    app.run(host='0.0.0.0', port=5001)
