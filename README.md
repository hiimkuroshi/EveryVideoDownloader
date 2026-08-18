# EveryVideoDownloader

> **Professional Desktop Web UI & Workstation for yt-dlp**  
> Powered directly by the **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** Python Source Engine.  
> Modern 2-column studio layout, format explorer, sequential download queue, multi-threading acceleration, subtitle extraction, and automated title translation.

---

**Language:** **English** | [Tiếng Việt](README_VI.md)

---

## 1. Overview

**EveryVideoDownloader** is a standalone Desktop Web UI Workstation engineered to harness the complete feature set of the open-source **yt-dlp** command-line engine across 1,800+ supported platforms (YouTube, Bilibili, TikTok, Douyin, Facebook, X/Twitter, Instagram, etc.).

Unlike conventional wrappers that rely on opaque pre-compiled binaries, EveryVideoDownloader executes directly against the **official Python source package (`core/yt_dlp/`)**. This architecture enables direct source code inspection, custom extractor extensibility, zero PyInstaller decompression latency, and native performance.

---

## 2. Prerequisites & Required Tools

To ensure all video merging, format conversion, and streaming features operate seamlessly, ensure the following dependencies are installed:

### Required Dependencies Summary

| Dependency | Recommended Version | Purpose | Requirement |
| :--- | :--- | :--- | :---: |
| **Node.js** | v18.0.0 or higher | Runs the Express backend server (Port 3000) and serves the Web UI | **Required** |
| **Python** | v3.9 or higher | Executes the `core/yt_dlp` source engine module natively | **Required** |
| **FFmpeg** | v5.0 or higher | Merges separate video and audio streams (1080p, 2K, 4K, 8K), embeds subtitles, extracts audio tracks (MP3/M4A), and converts containers | **Highly Recommended** (Critical for HD/UHD) |
| **Web Browser** | Chrome / Firefox / Edge / Brave | Displays the Studio interface and supplies browser cookies for age-restricted content | Optional |

---

### Step-by-Step Tool Installation Guide

#### 1. Install Node.js
* Download the **LTS** installer from the official portal: [https://nodejs.org](https://nodejs.org)
* Verify installation:
  ```bash
  node -v
  npm -v
  ```

#### 2. Install Python
* Download the latest release from: [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **Important (Windows)**: Ensure the checkbox **"Add python.exe to PATH"** is selected during setup.
* Verify installation:
  ```bash
  python --version
  ```

#### 3. Install FFmpeg (Automatic or Manual)
* **Option A (Automatic via Windows Package Manager)**:
  ```powershell
  winget install Gyan.FFmpeg
  ```
* **Option B (Manual Static Binary)**:
  1. Download the build archive from [Gyan.dev FFmpeg Builds](https://www.gyan.dev/ffmpeg/builds/).
  2. Extract `ffmpeg.exe` and place it either in your system `PATH`, in the project root, or inside the `bin/` directory.
* Verify installation:
  ```bash
  ffmpeg -version
  ```

---

## 3. Quick Start Guide

### Option 1: 1-Click Startup (Recommended for Windows)
* Double-click **`Chay_Studio.bat`** (or `Run_Studio.bat`).
* The startup script executes an environment diagnostic scan, launches the Express backend, and automatically opens your default browser at **`http://localhost:3000`**.

### Option 2: Command Line (CLI)
```bash
# 1. Install Node.js dependencies (first-time only)
npm install

# 2. Start the application server
npm start

# 3. (Optional) Run the comprehensive 15-point automated test suite
npm test
```
Navigate to: **`http://localhost:3000`**

---

## 4. Key Features

* **2-Column Desktop Studio Layout**: Designed specifically for widescreen monitors to eliminate wasted horizontal whitespace and minimize vertical scrolling.
* **15+ Formats Explorer with 3-State Sorting**: Full format breakdown (AV1, HEVC, AVC, VP9, Opus, AAC) with 3-state sorting (Default ➔ Descending ➔ Ascending) by ID, resolution, bitrate, and size.
* **Sequential Download Queue**: Select multiple video/audio formats directly from the table and batch-download them sequentially.
* **Real-time Server-Sent Events (SSE)**: Live streaming of progress metrics including large percentage indicators, download speed (`MiB/s`), remaining time (`ETA`), and transferred file size.
* **Independent Subtitle Downloader**: Parses both authored and auto-generated subtitle tracks with Vietnamese language prioritization, instant `.srt` conversion (with standardized timestamps), `.vtt` export, and live subtitle cue preview.
* **Direct HD Thumbnail Downloader**: High-resolution thumbnail extraction with a built-in reverse proxy that resolves HTTP 403 Forbidden errors on Bilibili and Douyin while filtering duplicates on YouTube playlists.
* **Multi-threaded Acceleration & Anti-Throttling**: Built-in concurrent fragment downloading (`-N 8/16`) and HTTP chunk sizing (`--http-chunk-size 10M`).
* **Safe Pause, Resume & Cancel**: Clean subprocess cancellation with seamless resume capabilities leveraging `.part` temporary files.
* **Windows Explorer Native Folder Picker**: Dedicated FolderBrowserDialog integration for intuitive directory selection and instant (<10ms) directory opening.
* **Multilingual Studio (i18n) & Automatic Translation**: 4 language interfaces (English, Vietnamese, Simplified Chinese, Japanese) with free Google Translate API integration.
* **Dedicated Platform Resolvers**:
  * **Douyin**: Direct `aid=6383` endpoint integration and `ttwid` cookie generation unlocking 4K UHD, 2K QHD, and 1080p 60fps streams.
  * **TikTok**: Direct watermark-free HD video and MP3 audio extraction bypassing Anti-Bot WAF challenges.

---

## 5. Project Directory Blueprint

```text
EveryVideoDownloader/
├── bin/                          # Binary utilities (Windows Folder Picker dialog)
│   └── folder_picker.exe
├── core/                         # Python Source Engine (1,800+ extractors & downloaders)
│   ├── LICENSE                   # Official yt-dlp MIT License
│   └── yt_dlp/                   # Official Python package
├── docs/                         # Architecture, design specifications & release logs
│   ├── DESIGN.md                 # UI/UX design tokens and layout specifications
│   ├── RELEASE_NOTES.md          # Version changelog
│   ├── YTDLP_CORE_ARCHITECTURE.md # Deep-dive technical engine analysis
│   └── YTDLP_CORE_ARCHITECTURE_EN.md
├── Download/                     # Default output directory for downloaded media
│   └── .gitkeep
├── public/                       # Frontend Web UI Assets
│   ├── assets/
│   │   └── design-tokens.css     # Design tokens and theme CSS variables
│   ├── help.json
│   ├── i18n.js                   # Multilingual localization dictionary (en, vi, zh, ja)
│   ├── index.html                # 2-column studio layout, format table & queue
│   ├── script.js                 # Event orchestrator, SSE client, sorting & queue
│   └── style.css                 # Glassmorphism design system & Dark/Light mode
├── tests/                        # Automated Test Suite (Run via "npm test")
│   └── test_suite.js             # 15-point end-to-end automated verification runner
├── .gitignore                    # Git rules ignoring temporary cache and media files
├── Chay_Studio.bat               # 1-click launcher for Windows (Vietnamese)
├── Run_Studio.bat                # 1-click launcher alias
├── config.json                   # User runtime configuration storage
├── package.json                  # Node.js project manifest and scripts
├── package-lock.json             # Locked dependency tree
├── README.md                     # Official documentation (English - this file)
├── README_VI.md                  # Official documentation (Vietnamese)
├── server.js                     # Express Backend Server (Port 3000)
└── setup.js                      # Automated environment scanner and diagnostic tool
```

---

## 6. Backend API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/config` | Retrieves current application configuration and download directory |
| `POST` | `/api/config` | Persists updated output directory path to `config.json` |
| `GET` | `/api/info` | Extracts full video metadata, formats, and subtitles in JSON via Python core |
| `GET` | `/api/download` | Initiates media download and streams real-time progress events over SSE |
| `GET` | `/api/cancel-download` | Safely terminates an active download subprocess |
| `GET` | `/api/download-thumbnail` | Downloads HD video thumbnail directly or via yt-dlp fallback |
| `GET` | `/api/download-subtitle` | Downloads converted `.srt` or raw `.vtt` subtitle files directly |
| `GET` | `/api/preview-subtitle` | Retrieves the initial subtitle dialogue cues for modal preview |
| `GET` | `/api/browse-folder` | Opens native Windows folder browser dialog |
| `GET` | `/api/open-folder` | Opens target directory in Windows Explorer (<10ms) |
| `GET` | `/api/proxy-image` | Reverse proxy for image requests bypassing HTTP 403 Forbidden |
| `GET` | `/api/translate` | Translates video title via Google Translate API |

---

## 7. License & Credits

* Media extraction and downloading core is provided by the open-source **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** project (MIT License).
* EveryVideoDownloader is developed and distributed under the **MIT License**.