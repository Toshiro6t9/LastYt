# Toshiro YT Music Downloader - Design Guidelines

## Design Approach
**Reference-Based Strategy**: Drawing inspiration from Spotify's visual hierarchy and YouTube Music's content density, combined with Apple Music's typographic restraint. Focus on album artwork showcase, efficient navigation, and immediate music discovery.

**Core Principles**:
- Content-first: Album art and track listings dominate the interface
- Glanceable information: Quick access to download status, playback controls
- Spatial efficiency: Dense layouts without feeling cramped
- Performance indicators: Visual feedback for loading, buffering, downloads

---

## Typography System

**Primary Font**: Inter (Google Fonts)
**Accent Font**: DM Sans (Google Fonts)

**Hierarchy**:
- Hero/Main Titles: DM Sans, 48px/56px (desktop), 600 weight
- Section Headers: DM Sans, 32px, 600 weight
- Card Titles/Track Names: Inter, 16px, 500 weight
- Metadata (Artist, Album): Inter, 14px, 400 weight
- UI Labels/Buttons: Inter, 14px, 500 weight
- Secondary Info: Inter, 12px, 400 weight, reduced opacity

**Special Treatments**:
- Truncate long track/artist names with ellipsis
- Use letter-spacing: -0.02em for headlines
- Maintain 1.5 line-height for body text

---

## Layout System

**Tailwind Spacing Primitives**: Use units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Icon spacing: mr-2, ml-3

**Grid Strategy**:
- Desktop: 4-5 column album grids (grid-cols-5)
- Tablet: 3 column grids (md:grid-cols-3)
- Mobile: 2 column grids (grid-cols-2)
- Playlist view: Single column with album art thumbnails

**Container Widths**:
- Main content: max-w-7xl
- Sidebar: w-64 (fixed navigation)
- Player bar: Full-width, sticky bottom

---

## Component Library

### Navigation Structure
**Sidebar (Left, Fixed)**:
- Logo/branding at top
- Primary nav items: Home, Search, Library, Downloads, Playlists
- Secondary items: Settings, About
- Active state: border-l-4 accent indicator
- Icon + label pattern (24px icons)

### Hero Section
**Full-width Featured Banner** (h-96):
- Large album/playlist artwork background with gradient overlay
- Prominent play/download buttons (blurred glass background)
- Track count, duration, artist metadata
- Scrolling hero carousel for multiple featured items

### Album/Track Cards
**Standard Card Pattern**:
- Square album artwork (aspect-ratio-1)
- Hover state: scale-105 transform, show play overlay
- Track title + artist below artwork
- Download icon indicator (top-right overlay)
- Play button overlay on hover (center, blurred backdrop)

### Music Player Bar (Bottom, Sticky)
**Three-column Layout**:
- Left: Current track info + album thumbnail (64px)
- Center: Playback controls (previous, play/pause, next, shuffle, repeat)
- Right: Volume, download progress, queue toggle
- Progress bar spans full width above controls
- Height: h-20 to h-24

### Search Interface
**Instant Search Results**:
- Large search input with icon (h-12)
- Results grouped by: Tracks, Albums, Artists, Playlists
- Grid of results with album art thumbnails
- Filter chips: All, Songs, Albums, Artists

### Download Manager
**List View with Status Indicators**:
- Track thumbnail, title, artist
- Progress bars for active downloads
- Status badges: Queued, Downloading, Complete, Failed
- Batch actions: Download All, Clear Completed

### Queue/Playlist View
**Draggable List Items**:
- Drag handles (left icon)
- Album art thumbnail (48px)
- Track info (title, artist, duration)
- Remove/favorite actions (right side)
- Playing indicator animation for current track

### Modal Overlays
**Track Details/Options**:
- Centered modal with backdrop blur
- Album artwork header
- Actions: Add to Playlist, Download, Share, Go to Album
- Keyboard navigation support (Esc to close)

---

## Images Section

**Hero Section**: 
- Yes, include large hero image (1920x600px recommended)
- Type: Featured album artwork, artist photography, or curated playlist imagery
- Treatment: Gradient overlay (dark gradient from bottom to top for readability)
- Placement: Full-width banner below navigation
- Buttons: Blurred glass background (backdrop-blur-md) for Primary CTA and secondary Download button

**Album/Playlist Cards**:
- Square album artwork throughout (300x300px minimum)
- Source: YouTube thumbnail images or placeholder gradients
- Hover state enhancement with subtle overlay

**Track Listings**:
- Small square thumbnails (48x48px or 64x64px)
- Consistent sizing throughout player, queue, and search results

**Background Treatments**:
- Subtle gradient meshes in empty states
- Frosted glass effects for overlays and modals

**Image Loading**:
- Skeleton placeholders during load
- Blur-up progressive loading for large images
- Fallback solid gradient for missing artwork

---

## Spacing & Rhythm

**Vertical Rhythm**:
- Hero to content: mb-12
- Between sections: mb-16 to mb-20
- Card grids: gap-6
- List items: space-y-2

**Horizontal Spacing**:
- Page margins: px-6 to px-8
- Card padding: p-4
- Button padding: px-6 py-3

**Consistency**: All interactive elements maintain 44px minimum touch target height for accessibility.