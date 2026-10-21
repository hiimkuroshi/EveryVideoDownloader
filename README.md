# EveryVideo

EveryVideo is a local media download studio with format inspection, subtitle tools, download queues, advanced network controls, and a responsive Graphite Signal interface.

**Language:** **English** | [Tiếng Việt](README_VI.md)

## Quick Start

### Windows x64 desktop app

The desktop app includes its own Node.js, Python, FFmpeg/FFprobe, aria2 and headless Chromium runtimes.

Download from [GitHub Release v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0).

- `EveryVideo-1.2.0-Setup-x64.exe`: per-user installer with shortcuts and an uninstaller.
- `EveryVideo-1.2.0-Portable-Folder-x64.zip`: **recommended portable option**. Extract the whole archive once to a dedicated folder, then launch `EveryVideo.exe`; keep all companion files and folders.
- `EveryVideo-1.2.0-Portable-x64.exe`: single-file wrapper that extracts its bundled runtime to a temporary folder **on every launch**, making startup slower than the folder or installed app.

Settings and UI data live under `%APPDATA%/EveryVideo`, including when using the portable executable. Downloads default to your Windows Downloads/EveryVideo folder and can be changed in the app. Closing the app cancels active downloads. Local builds currently have no publisher signature.

With the portable runtimes prepared in `.runtime/`, build on Windows using `npm ci`, `npm run desktop:check`, then `npm run desktop:build`. Run `npm run test:desktop` against the unpacked build. `npm run desktop` opens the desktop shell from source; `npm start` keeps the original browser workflow. See [Windows desktop build notes](docs/WINDOWS_DESKTOP.md) for prerequisites and verification details.

### Windows one-click launcher

Double-click `Chay_Studio.bat` or `Run_Studio.bat`. The launcher checks the required tools, starts the server, and opens `http://localhost:3000`.

### Command line

```bash
npm install
npm run setup:browser
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Requirements

| Dependency | Recommended | Purpose |
| --- | --- | --- |
| Node.js | 22+ | Express server and media discovery |
| Python | 3.9+ | Runs the bundled `core/yt_dlp` source package |
| FFmpeg | 5+ | Merging, conversion, audio extraction, and subtitle embedding |
| aria2c | Optional | Multi-range HTTP(S) acceleration for direct Bilibili `.m4s` files |
| Browser | Edge, Chrome, Firefox, or Brave | Local application UI and optional browser cookies |
| Chromium headless | Optional, installed by `npm run setup:browser` | DOM and network discovery for interactive pages |

The server resolves Python in this order:

1. `EVERYVIDEO_PYTHON` environment variable.
2. Project-local `.runtime/python/python.exe` (portable runtime) or `.venv`/`venv`.
3. `py.exe`, `python.exe`, or `python3.exe` on `PATH`.

To use an explicit runtime in PowerShell:

```powershell
$env:EVERYVIDEO_PYTHON = "C:\Path\To\python.exe"
npm start
```

EveryVideo launches Python, Windows Explorer, and the native folder picker as child processes. The server must run in an environment that permits child-process creation; restricted sandboxes can return `spawn EPERM`.

## Features

- Paste URLs from different websites to discover audio, video, covers, galleries, subtitles, and HLS/DASH sources.
- Copy original URLs or download individual assets, including sources on websites the extraction engine does not recognize.
- Combine HTML/JSON/iframe discovery with the existing extraction engine and optional browser scanning.
- Graphite Signal dark/light interface with a single coral interaction accent.
- Desktop format workstation with a fully usable 390 px mobile layout.
- Detailed format explorer with filtering, search, sorting, table/card modes, and multi-select.
- Sequential download queue with SSE progress, speed, ETA, pause, resume, and cancel controls.
- Subtitle discovery, preview, `.srt` conversion, and `.vtt` download.
- HD thumbnail download with proxy fallback for protected image hosts.
- Time-range downloads, output container selection, multi-fragment acceleration, and HTTP chunk controls.
- Bilibili direct-stream acceleration with `Auto`, `Native`, and optional `aria2c` engines (4/8/16 connections).
- Bilibili uses Huawei Overseas `upos-sz-mirrorhwo1` by default in this workspace after a 656 MiB long-file benchmark showed `mirrorcosov` throttling to ~0.6 MiB/s after ~200 MiB while `mirrorhwo1` sustained multi-MiB/s throughput through completion; `auto`, `fastest`, and the other mirrors remain available for A/B testing and rollback.
- Native Windows folder picker and verified Explorer launch feedback.
- Vietnamese, English, Simplified Chinese, and Japanese UI.
- Resilient multi-provider title translation.
- Dedicated Douyin and TikTok metadata/download resolvers.

## Discover media from a URL

Paste a webpage or direct media URL and click **Analyze**. The **Media on this page** panel lists sources with type, quality when supplied, verification status, and **Copy URL** / **Download** actions. Filter by audio, video, images, streams, or subtitles. Downloads use the selected folder and preserve existing files by choosing a new filename.

HTML scanning and the extraction engine run together. Browser scanning starts automatically when a dynamic page has no playable source; enable **Scan interactive content too** to request it for other pages. Install its project-local Chromium runtime once with `npm run setup:browser`. The browser uses an isolated anonymous session; the cookie selector continues to apply to the existing extraction engine.

Known platforms keep their format presets, merging options, and queue workflow. Individual discovered assets use their own download buttons; advanced conversion, time trimming, and queue options apply to the existing format workflow. A copied HLS/DASH URL is a playlist, while downloading it through the app uses Python/FFmpeg to assemble media. A copied URL may require Referer or session information; the app retains browser session cookies privately when needed.

Discovery is bounded to the supplied page, a limited number of embedded frames, and at most 120 assets. A page can include recommendations or decorative images as well as its main media. Large pages may have unchecked candidates; clicking **Download** verifies that source before saving. Source descriptors expire after 15 minutes; analyze again to refresh them. Signed queries remain intact and partial results are retained.

Coverage cannot be guaranteed for every URL. DRM, unavailable or private content, anti-bot challenges, and players requiring additional interaction can prevent extraction. The app does not bypass those restrictions.

## Graphite Signal UI

The interface brand is **EveryVideo**. Engine attribution is intentionally omitted from the application chrome while the underlying extraction engine remains unchanged.

The canonical design contract is [DESIGN.md](DESIGN.md). The implementation is isolated in `public/graphite-signal.css` so visual changes do not replace DOM hooks, API contracts, or download behavior.

Accessibility and responsive behavior include:

- Skip link and semantic tab/tabpanel relationships.
- Keyboard tab navigation with Arrow, Home, and End keys.
- Visible focus states and reduced-motion support.
- No page-level horizontal overflow at 390 px.
- Toast live regions and guarded error rendering.

## Project Structure

```text
EveryVideoDownloader/
├── bin/                          # Native Windows folder picker
├── core/yt_dlp/                  # Vendored Python engine
├── desktop/                      # Electron shell, icon and licenses
├── docs/                         # Guides, architecture and docs/plans/
├── lib/                          # Runtime, download and media modules
├── project-vault/                # Project working memory
├── public/                       # HTML/CSS/JavaScript interface
├── scripts/                      # Setup, build and benchmark helpers
├── tests/                        # Contract, unit and integration tests
├── dist/                         # Installer/ZIP; win-unpacked/ runs directly
├── Download/                     # Media; incomplete/ holds partial files
├── output/                       # Reports, screenshots and test data
├── .runtime/                     # Python, FFmpeg, aria2 and Chromium
├── DESIGN.md                      # Canonical design contract
├── electron-builder.cjs          # Windows packaging configuration
├── package.json
├── server.js                     # Express backend
└── setup.js
```

See the [folder map and documentation index](docs/README.md). Runtime, build and output directories are Git-ignored.

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/config` | Read runtime configuration and the active download directory |
| `POST` | `/api/config` | Persist download directory and advanced settings |
| `GET` | `/api/info` | Extract metadata, formats, playlists, and subtitles |
| `POST` | `/api/resolve` | Discover multiple assets and return metadata plus a temporary resolution ID |
| `GET` | `/api/media-preview` | Preview an image using its resolution and asset IDs |
| `GET` | `/api/media-download` | Download a resolved direct source or manifest over SSE |
| `GET` | `/api/download` | Start a download and stream progress over SSE |
| `GET` | `/api/cancel-download` | Stop an active download process |
| `GET` | `/api/download-thumbnail` | Save an HD thumbnail |
| `GET` | `/api/download-subtitle` | Save `.srt` or `.vtt` subtitles |
| `GET` | `/api/preview-subtitle` | Return subtitle cue samples |
| `GET` | `/api/browse-folder` | Open the native Windows folder picker |
| `GET/POST` | `/api/open-folder` | Open a directory and report the actual Explorer spawn result |
| `GET` | `/api/proxy-image` | Proxy protected remote images |
| `GET` | `/api/translate` | Translate titles with provider fallback |

Process launch errors are returned as JSON. `EPERM` and missing-Python errors no longer fall through to an Express HTML error page.

### Bilibili speed controls

The Bilibili settings separate three mechanisms that affect different download paths:

- `--concurrent-fragments` controls parallel DASH/HLS fragments; it does not create eight connections for one direct `.m4s` URL.
- `--http-chunk-size` performs sequential Range requests in the native downloader.
- `aria2c` uses multiple Range connections for direct HTTP(S) media. In `Auto`, EveryVideo uses it when available and falls back to native once if the external downloader fails. DASH/HLS manifests stay on the native fragment downloader.

EveryVideo also detects project-local portable binaries at `.runtime/aria2/aria2c.exe` and `.runtime/ffmpeg/ffmpeg.exe`. Otherwise, place `aria2c.exe` in `bin/`, set `EVERYVIDEO_ARIA2C`, or use a system `PATH` install. A missing aria2 binary is safe: `Auto` continues with native downloads, while explicit `aria2c` reports a clear SSE error. The UI exposes 4/8/16 connection profiles and disables native chunk size while aria2 is active.

The `fastest` CDN option performs up to four small Range probes (2 MiB, 4-second timeout) against exact base/backup URLs returned by Bilibili. This is useful for short transfers, but a small probe cannot detect long-transfer token-bucket throttling; the local default therefore uses the long-file-tested `mirrorhwo1`. Probe failures fall back to the existing anti-P2P selection; signed URLs and query strings are not written to diagnostics.

## Verification

Run fast, non-destructive contract checks:

```bash
npm run test:contracts
```

These checks verify unique API routes, guarded process errors, unique DOM IDs, and every static JavaScript DOM hook.

Run the no-network downloader option tests as well:

```bash
npm run test:unit
```

The Python Bilibili selector/probe tests use the project-local portable runtime when present, or another installed Python runtime:

```bash
npm run test:python
```

The media suites use temporary local HTTP fixtures and generated media, without changing user configuration. Install Chromium first; integration checks also require the project-local Python and FFmpeg/FFprobe runtimes:

```bash
npm run test:media
npm run test:media-ui
```

They cover unknown domains, HTML/JSON/Nuxt, cross-host frames, JavaScript/POST/session handling, preview/download/cancel, HLS/DASH output verified with FFprobe, clipboard, languages, and mobile layout. UI screenshots are written under `output/playwright/`.

The original comprehensive suite performs real network downloads and modifies runtime configuration:

```bash
npm test
```

Use it only in a disposable test environment.

## Documentation

- [Graphite Signal design contract](DESIGN.md)
- [UI overhaul plan and implementation status](docs/plans/ui-overhaul-plan.md)
- [Project summary](docs/PROJECT_SUMMARY.md)
- [Release notes](docs/RELEASE_NOTES.md)
- [Core architecture — English](docs/YTDLP_CORE_ARCHITECTURE_EN.md)
- [Core architecture — Vietnamese](docs/YTDLP_CORE_ARCHITECTURE.md)

## License and Credits

The extraction and download core is provided by the open-source [yt-dlp](https://github.com/yt-dlp/yt-dlp) project under its license. EveryVideoDownloader is distributed under the MIT License.
