# GoatBot Sing Command Emulator - Design Guidelines

## Design Approach
**Selected System**: Linear + Vercel Aesthetic Fusion
Modern developer tool with minimalist precision, sharp typography, and sophisticated dark mode implementation.

## Core Design Principles
- Surgical precision: Every element serves a clear purpose
- Data clarity: Information hierarchy that guides users effortlessly
- Technical elegance: Professional tool that feels premium

---

## Typography System

**Primary Font**: Inter (Google Fonts)
**Secondary Font**: JetBrains Mono (for URLs/code elements)

Hierarchy:
- Hero Heading: text-6xl font-bold tracking-tight
- Section Headings: text-3xl font-semibold
- Subsections: text-xl font-medium
- Body Text: text-base leading-relaxed
- Technical Text: text-sm font-mono
- Captions: text-sm text-muted

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
**Container**: max-w-6xl mx-auto
**Section Padding**: py-16 md:py-24
**Component Gaps**: gap-6 to gap-8

---

## Page Structure

### Hero Section (80vh minimum)
**Large Hero Image**: Yes - Dynamic audio waveform visualization or abstract sound wave patterns in electric blue/purple gradients against dark backdrop

Content overlay (centered):
- "GoatBot Sing" primary heading
- "Professional YouTube audio extraction via Render API" subheading (text-xl)
- Primary CTA button with blur background (backdrop-blur-xl bg-white/10)
- Secondary stats row: "Instant Downloads • High Quality • API Powered"

### Main Interface Section
Two-column desktop layout (grid-cols-1 lg:grid-cols-2 gap-8):

**Left Column - Input Panel**:
- Card container with subtle border
- "Paste YouTube URL" label with icon
- Large input field (h-14) with monospace font for URLs
- Quality selector dropdown (Audio: 320kbps, 256kbps, 192kbps)
- Format selector (MP3, WAV, FLAC)
- Prominent "Download Audio" button (w-full h-12)
- Progress indicator bar below (hidden until active)

**Right Column - Information Panel**:
- Real-time API status badge (green dot + "API Online")
- Queue position counter
- Recent downloads list (5 items max) with file names, duration, size
- Each list item shows thumbnail placeholder, title, timestamp

### Features Grid Section
Three-column grid (grid-cols-1 md:grid-cols-3 gap-6):

1. **Instant Processing**
   - Heroicon: bolt icon
   - Render API integration
   - Sub-second response times

2. **High Fidelity**
   - Heroicon: musical-note icon
   - Multiple quality options
   - Lossless format support

3. **Developer Friendly**
   - Heroicon: code-bracket icon
   - REST API access
   - Rate limit transparency

### Technical Specifications Section
Single column, max-w-4xl:
- API endpoint documentation preview
- Supported formats table (Format | Bitrate | File Size Est.)
- Rate limits card (clear numerical display)

### Footer
Full-width with three sections:
- Left: GoatBot logo + tagline
- Center: Quick links (API Docs, Status, GitHub)
- Right: Social icons + "Built with Render API" badge

---

## Component Library

**Cards**: Subtle border (border-white/10), rounded-xl, p-6
**Buttons Primary**: Gradient from blue to purple, h-12, rounded-lg, font-semibold
**Buttons Secondary**: border-white/20, backdrop-blur effects
**Input Fields**: h-14, border-white/10, focus:border-blue-500, rounded-lg
**Status Badges**: Pill shape, px-3 py-1, dot indicator, text-xs font-medium
**Progress Bar**: h-2, rounded-full, gradient fill, animated

**Icons**: Heroicons (outline style), size-6 for features, size-5 for UI elements

---

## Images

**Hero Background** (1920x1080): Abstract 3D audio waveform visualization with electric blue and purple gradient waves flowing horizontally against deep navy/black background. Motion-blurred effect suggesting speed and processing power.

**Feature Icons**: Use Heroicons exclusively - no custom images needed for feature cards.

---

## Dark Mode Implementation
Primary background: Near black (#0a0a0a to #111)
Secondary panels: #1a1a1a
Borders: white/10 opacity
Text primary: white
Text secondary: white/60
Accents: Electric blue (#3b82f6) to purple (#8b5cf6) gradients

---

## Interaction Notes
- Input field glows on focus (ring-2 ring-blue-500)
- Download button shows loading spinner during processing
- Progress bar fills with gradient animation
- Recent downloads fade in/out with transitions
- Status badge pulses when processing
- All buttons use backdrop-blur-xl when over images