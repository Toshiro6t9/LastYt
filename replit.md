# YouTube Audio Streaming APIs

I have implemented a unified API in the main server that uses `yt-dlp` to extract direct audio URLs and stream them directly to the client.

### Unified API (Express)
- **Streaming**: `http://localhost:5000/api/audio/play?url=<YOUTUBE_URL>`
- **Download**: `http://localhost:5000/api/audio/download?url=<YOUTUBE_URL>`

### Features
- **yt-dlp Integration**: High-performance extraction of direct audio URLs.
- **Direct Streaming**: No temporary or permanent file storage. Audio is piped directly from YouTube's CDN to the user.
- **Memory Efficient**: Uses streams and piping to handle large files safely.
- **Production Ready**: Includes basic URL validation, timeouts, and error handling.
- **Compatibility**: Returns appropriate `Content-Type` and `Content-Length` headers, making it compatible with Discord/Messenger bots and HTML5 audio players.

### Legacy Standalone APIs
- **Python API (Port 5001)**:
  - Play: `/play?url=<YOUTUBE_URL>`
  - Download: `/download?url=<YOUTUBE_URL>`
- **NodeJS API (Port 5002)**:
  - Play: `/play?url=<YOUTUBE_URL>`
  - Download: `/download?url=<YOUTUBE_URL>`
