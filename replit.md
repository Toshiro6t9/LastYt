# Toshiro Yt Music Downloader

I have implemented two standalone APIs (Python/Flask and NodeJS/Express) that use `yt-dlp` to extract direct audio URLs and stream them directly to the client.

### Features
- **yt-dlp Integration**: High-performance extraction of direct audio URLs.
- **Direct Streaming**: No temporary or permanent file storage. Audio is piped directly from YouTube's CDN to the user.
- **Memory Efficient**: Uses chunked streaming (Python) and streams/piping (NodeJS) to handle large files safely.
- **Production Ready**: Includes basic URL validation, timeouts, and error handling.

### How to use
- **Python API**:
  - Play: `http://localhost:5001/play?url=<YOUTUBE_URL>`
  - Download: `http://localhost:5001/download?url=<YOUTUBE_URL>`
- **NodeJS API**:
  - Play: `http://localhost:5002/play?url=<YOUTUBE_URL>`
  - Download: `http://localhost:5002/download?url=<YOUTUBE_URL>`

### Implementation details
1. **Extraction**: `yt-dlp -f bestaudio --get-url` is used to find the direct source.
2. **Streaming**: 
   - In Python, `requests.get(stream=True)` with a generator is used.
   - In NodeJS, `axios` with `responseType: 'stream'` and `.pipe(res)` is used.
3. **Compatibility**: Both return appropriate `Content-Type` and `Content-Length` headers, making them compatible with Discord/Messenger bots and HTML5 audio players.
