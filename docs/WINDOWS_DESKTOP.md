# EveryVideo Windows desktop

## Use the application

Build outputs include an NSIS installer, a self-extracting executable and a portable folder ZIP. All include the same Windows x64 application and download runtimes.

- `dist/EveryVideo-1.2.0-Setup-x64.exe`: creates desktop/Start menu shortcuts and supports uninstall.
- `dist/EveryVideo-1.2.0-Portable-Folder-x64.zip`: recommended for portable use. Extract the whole archive once into a dedicated folder, then run `EveryVideo.exe`. Keep all companion resources in place.
- `dist/EveryVideo-1.2.0-Portable-x64.exe`: extracts the full application into a temporary directory on every launch and removes it on exit. This repeats substantial disk work, so startup is slower than the installed or folder app.

Published downloads: [EveryVideo v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0). Local builds write these files under `dist/`.

The ready-to-run copy kept in this project is `dist/win-unpacked/EveryVideo.exe`. The duplicate `dist/EveryVideo-Portable-Folder/` extraction was removed during project cleanup after comparing every payload file. Keep the companion files in `win-unpacked/` when running or copying it.

All variants save settings, local storage and shell logs under the Windows app-data folder for EveryVideo. Downloads default to Downloads/EveryVideo and can be changed in settings. Personal settings/cookies and existing downloaded media are not copied from the build machine. Removing or upgrading the application preserves user data. Closing the window cancels its download processes.

These local builds are unsigned. A publisher certificate is required for signed releases. No update service or automatic publishing is configured.

## Workspace after disk cleanup

The 2026-10-23 cleanup retained the complete `dist/win-unpacked/` application, source code, Git history, configuration, downloaded media and compact verification reports. It removed development `node_modules/`, the duplicate root `.runtime/`, landing-page dependencies/build output, generated site archives, old QA screenshots and unused builder metadata. The published landing page was not changed.

The packaged application runs without these external development files. To resume development, run `npm ci` in the project root; run it separately in `sites/everyvideo-landing/` for the marketing site. Before running native source-mode tests or building another Windows package, restore the runtime layout in the table below. Python, FFmpeg and Playwright copies remain available under `dist/win-unpacked/resources/.runtime/`; the bundled `aria2/` contents must be restored to `.runtime/aria2/aria2-1.37.0-win-64bit-build1/` for the current builder configuration.

Cleanup inventory, the original app SHA-256 manifest, verification summary and a fresh desktop screenshot are kept in `output/reports/windows-only-cleanup-20261023/`.

The subsequent local UI update on 2026-10-23 makes the format table the default Studio result and moves discovered sources into a secondary tab. The current `dist/win-unpacked/` copy includes this update: exactly five `public/` files were replaced inside `resources/app.asar`, with all other archive contents and native runtime files retained. Published v1.2.0 downloads were not rebuilt. UI and full desktop checks are recorded in `output/reports/workspace-tabs-20261023/`.

The next local update on the same date enables automatic audio merging for selected video-only formats and queued downloads. Discovered sources select matching audio from the same extracted content, with manual audio selection and raw-source download available. This replaces eight `public/`/`lib/` files in ASAR and `resources/scripts/download-resolved-media.py`; runtimes remain unchanged. Open the current `dist/win-unpacked/EveryVideo.exe` to use it. Real fixture output passed FFprobe and the full desktop smoke; evidence is in `output/reports/auto-audio-merge-20261023/`. Published installers and archives still contain the earlier release.

## Check for updates

Open **Cài Đặt → Cập nhật EveryVideo → Kiểm tra cập nhật** (English: **Settings → EveryVideo updates → Check for updates**). The app compares its package version with the latest stable GitHub release. When a newer version is available, **Mở trang tải bản mới / Open download page** opens that release in your browser.

Checks run when you press the button and have a 10-second GitHub timeout. Results are cached for five minutes; failures are cached for 30 seconds. Network failures and GitHub rate limits show a retry message. This checks the EveryVideo application release; installation is performed from the GitHub download page.

The local `dist/win-unpacked/` app includes this feature as of 2026-10-23. Source and seven ASAR entries were updated; native runtimes and published v1.2.0 installers/archives are unchanged. Verification is recorded in `output/reports/github-update-check-20261023/`.

## Prepare a build

Use Windows x64 with Node.js 22+ for development. Run `npm ci`; if npm's install-script policy blocks the Electron download, run `node node_modules/electron/install.js` explicitly.

Prepare these local resources (not committed):

| Resource | Required layout |
| --- | --- |
| Python embeddable 3.14 x64 | `.runtime/python/python.exe`, DLLs, standard library ZIP, `python314._pth`, `LICENSE.txt` |
| Python import path | `python314._pth` includes `python314.zip`, `.`, and `../../core`; enables `import site` |
| FFmpeg/FFprobe | `.runtime/ffmpeg/ffmpeg.exe`, `ffprobe.exe` |
| aria2 1.37.0 x64 | `.runtime/aria2/aria2-1.37.0-win-64bit-build1/` with executable and license files |
| Playwright browser | `npm run setup:browser` populates `.runtime/playwright/` |
| Folder picker | `bin/folder_picker.exe` |

Download binaries from the official project distributions, verify their checksums, and retain their licenses. The current local build uses Python 3.14.7, FFmpeg 9.0.1 essentials and aria2 1.37.0. `desktop/licenses/` contains the FFmpeg GPL text and build configuration; refresh notices and checks when replacing binaries. Python and aria2 notices, Chromium notices, Electron notices and dependency licenses accompany the app. The customized yt-dlp Python and JavaScript sources remain included under `resources/core/`.

## Build and verify

```powershell
npm run desktop:check
npm run desktop:pack
npm run test:desktop
npm run desktop:build
npm run test:desktop-portable
```

`desktop:check` executes bundled Python/core and Chromium and checks required build files. `desktop:pack` creates `dist/win-unpacked/EveryVideo.exe`. `desktop:build` builds NSIS, portable EXE and ZIP artifacts with no publishing. `desktop:zip` packages an existing tested `dist/win-unpacked/` directory without rebuilding it; run `desktop:pack` first when application code has changed. `desktop:benchmark` compares folder and self-extracting startup twice with isolated user data and records times under `output/desktop-smoke-startup-*/`. It accepts an extracted `EveryVideo.exe` path as an argument for testing a ZIP extraction directly.

`test:desktop` launches the packaged executable with an isolated data directory and a PATH containing only Windows system folders. It checks renderer isolation, API access controls, bundled Node/Python/aria2/Chromium, metadata extraction from a local fixture, DASH video/audio merging verified by FFprobe, cancellation, saved settings after restart, and process cleanup while quitting an active download. It also inspects the application archive for accidentally included personal data. Evidence stays under ignored `output/desktop-smoke-*/` folders.

`test:desktop-portable` launches the actual portable wrapper, connects only to its temporary local debugging port for the test, verifies the UI and bundled Python extraction, then closes the window and checks that the wrapper exits. Normal launches do not enable this port.

Saved startup measurements and screenshots are consolidated in `output/reports/windows-desktop-20261021/`. The older smoke-test directories and their temporary browser profiles were cleaned after retaining that evidence.

These checks run on the development Windows host. A separate clean Windows machine/VM is still needed to verify installation, uninstall, OS compatibility and publisher-trust behavior independently of the build machine. Network availability and service-specific extraction restrictions are separate from packaging checks.

## Implementation

`desktop/main.js` starts a separate backend with the embedded Electron Node runtime and an ephemeral loopback port. A random HttpOnly, SameSite cookie authorizes requests; other origins are rejected. The UI has no Node integration and runs with context isolation and Chromium sandboxing. The app is single instance per user-data directory. The desktop process terminates its backend process tree on quit, and the backend watches for a lost parent IPC connection.

`EVERYVIDEO_RESOURCES_DIR`, `EVERYVIDEO_DATA_DIR` and `EVERYVIDEO_DOWNLOADS_DIR` separate resources from writable data. The desktop shell sets the resource/runtime paths itself. The last two variables may be overridden for isolated tests. With no desktop environment, `npm start` retains the repository's existing paths and behavior.

`electron-builder.cjs` allowlists application files and external resources. Python/core, FFmpeg, aria2 and Playwright browsers stay outside ASAR so native child processes can read them. yt-dlp receives the embedded Node executable explicitly for JavaScript challenges. `.links`, cookies, configuration, profiles, media, the vault and scratch/output directories are excluded.
