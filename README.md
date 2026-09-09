# EveryVideo

EveryVideo is a local media download studio with format inspection, subtitle tools, download queues, advanced network controls, and a responsive Graphite Signal interface.

**Language:** **English** | [Tiếng Việt](README_VI.md)

## Quick Start

### Windows one-click launcher

Double-click `Chay_Studio.bat` or `Run_Studio.bat`. The launcher checks the required tools, starts the server, and opens `http://localhost:3000`.

### Command line

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Requirements

| Dependency | Recommended | Purpose |
| --- | --- | --- |
| Node.js | 18+ | Express server and Web UI |
| Python | 3.9+ | Runs the bundled `core/yt_dlp` source package |
| FFmpeg | 5+ | Merging, conversion, audio extraction, and subtitle embedding |
| aria2c | Optional | Multi-range HTTP(S) acceleration for direct Bilibili `.m4s` files |
| Browser | Edge, Chrome, Firefox, or Brave | Local application UI and optional browser cookies |

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

- Graphite Signal dark/light interface with a single coral interaction accent.
- Desktop format workstation with a fully usable 390 px mobile layout.
- Detailed format explorer with filtering, search, sorting, table/card modes, and multi-select.
- Sequential download queue with SSE progress, speed, ETA, pause, resume, and cancel controls.
- Subtitle discovery, preview, `.srt` conversion, and `.vtt` download.
- HD thumbnail download with proxy fallback for protected image hosts.
- Time-range downloads, output container selection, multi-fragment acceleration, and HTTP chunk controls.
- Bilibili direct-stream acceleration with `Auto`, `Native`, and optional `aria2c` engines (4/8/16 connections).
- Bilibili uses the benchmarked Tencent Overseas CDN candidate `upos-sz-mirrorcosov` by default in this workspace; `auto` and `fastest` remain available for A/B testing and rollback.
- Native Windows folder picker and verified Explorer launch feedback.
- Vietnamese, English, Simplified Chinese, and Japanese UI.
- Resilient multi-provider title translation.
- Dedicated Douyin and TikTok metadata/download resolvers.

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
├── bin/folder_picker.exe          # Native Windows folder picker
├── core/yt_dlp/                   # Bundled Python source engine
├── docs/
│   ├── PROJECT_SUMMARY.md
│   ├── RELEASE_NOTES.md
│   ├── YTDLP_CORE_ARCHITECTURE.md
│   └── ui-concepts/               # UI concept prompts and design notes
├── public/
│   ├── graphite-signal.css        # Current visual override layer
│   ├── i18n.js
│   ├── index.html
│   ├── script.js
│   └── style.css                  # Legacy component foundation
├── tests/
│   ├── server_contract_test.js
│   ├── download_acceleration_test.js
│   ├── test_bilibili_speed.py
│   ├── test_suite.js
│   └── ui_contract_test.js
├── lib/download-acceleration.js   # Bilibili engine/capability option builder
├── DESIGN.md                      # Canonical design contract
├── server.js
└── ui-overhaul-plan.md
```

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/config` | Read runtime configuration and the active download directory |
| `POST` | `/api/config` | Persist download directory and advanced settings |
| `GET` | `/api/info` | Extract metadata, formats, playlists, and subtitles |
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

The `fastest` CDN option performs up to four small Range probes (2 MiB, 4-second timeout) against exact base/backup URLs returned by Bilibili. Probe failures fall back to the existing anti-P2P selection; signed URLs and query strings are not written to diagnostics.

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

The comprehensive integration suite performs real network downloads and modifies runtime configuration:

```bash
npm test
```

Use it only in a disposable test environment.

## Documentation

- [Graphite Signal design contract](DESIGN.md)
- [UI overhaul plan and implementation status](ui-overhaul-plan.md)
- [Project summary](docs/PROJECT_SUMMARY.md)
- [Release notes](docs/RELEASE_NOTES.md)
- [Core architecture — English](docs/YTDLP_CORE_ARCHITECTURE_EN.md)
- [Core architecture — Vietnamese](docs/YTDLP_CORE_ARCHITECTURE.md)

## License and Credits

The extraction and download core is provided by the open-source [yt-dlp](https://github.com/yt-dlp/yt-dlp) project under its license. EveryVideoDownloader is distributed under the MIT License.
