# EveryVideo Windows packaging

Goal: ship Windows x64 NSIS installer and portable executable with the existing UI and bundled download runtimes.

- [x] Separate bundled resources, writable app data and default downloads; preserve CLI/web behavior.
- [x] Add an isolated Electron window, loopback backend on an available port, single instance and process cleanup.
- [x] Configure explicit packaging allowlists for core, Python, FFmpeg, aria2 and Playwright; exclude personal/runtime data.
- [x] Add desktop build commands, prerequisite validation, application icon and usage documentation.
- [x] Run regression tests and packaged smoke checks for UI, runtime discovery, extraction/download/mux/cancel and persistence.
- [x] Produce installer and portable executable, verify artifacts and record results in the project vault.

Complete when both artifacts exist and the packaged application starts and uses its bundled runtimes. Report any checks that require a separate clean Windows machine.

Completed: both artifacts are in `dist/` with `SHA256SUMS.txt`; unpacked and actual portable tests pass with isolated data and system-only PATH. The local artifacts are unsigned. Clean-VM installation/uninstallation remains a separate verification step.
