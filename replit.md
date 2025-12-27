# YouTube Audio Streaming API (Python)

Focused Python/Flask implementation for extracting and streaming YouTube audio directly to clients.

### Features
- **yt-dlp Integration**: High-performance extraction of direct audio URLs.
- **Direct Streaming**: No temporary file storage; audio is piped directly from YouTube's CDN.
- **Memory Efficient**: Uses chunked streaming (4KB chunks) to handle large files safely.
- **Production Ready**: Includes URL validation, 30s timeouts, and 403-bypass headers.

### Endpoints
- **Stream/Play**: `http://localhost:5001/play?url=<YOUTUBE_URL>`
- **Direct Download**: `http://localhost:5001/download?url=<YOUTUBE_URL>`

### Usage
Run the server:
```bash
python python_api/app.py
```

### Implementation Details
1. **Extraction**: Calls `yt-dlp -f bestaudio --get-url` with browser impersonation.
2. **Piping**: Uses Flask `Response(stream_with_context(generate()))` for zero-buffer delivery.
3. **Compatibility**: Returns `Content-Type`, `Content-Length`, and `Accept-Ranges` headers for seamless integration with bots (Discord/Messenger) and web players.
