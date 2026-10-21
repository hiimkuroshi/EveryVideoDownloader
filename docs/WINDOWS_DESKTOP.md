# EveryVideo Windows desktop

## Use the application

Build outputs include an NSIS installer, a self-extracting executable and a portable folder ZIP. All include the same Windows x64 application and download runtimes.

- `dist/EveryVideo-0.3.0-Setup-x64.exe`: creates desktop/Start menu shortcuts and supports uninstall.
- `dist/EveryVideo-0.3.0-Portable-Folder-x64.zip`: recommended for portable use. Extract the whole archive once into a dedicated folder, then run `EveryVideo.exe`. Keep all companion resources in place.
- `dist/EveryVideo-0.3.0-Portable-x64.exe`: extracts the full application into a temporary directory on every launch and removes it on exit. This repeats substantial disk work, so startup is slower than the installed or folder app.

The ready-to-run copy kept in this project is `dist/win-unpacked/EveryVideo.exe`. The duplicate `dist/EveryVideo-Portable-Folder/` extraction was removed during project cleanup after comparing every payload file. Keep the companion files in `win-unpacked/` when running or copying it.

All variants save settings, local storage and shell logs under the Windows app-data folder for EveryVideo. Downloads default to Downloads/EveryVideo and can be changed in settings. Personal settings/cookies and existing downloaded media are not copied from the build machine. Removing or upgrading the application preserves user data. Closing the window cancels its download processes.

These local builds are unsigned. A publisher certificate is required for signed releases. No update service or automatic publishing is configured.

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
