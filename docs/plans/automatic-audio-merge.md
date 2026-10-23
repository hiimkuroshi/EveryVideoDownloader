# Automatic audio merge

Goal: selecting a video stream produces one file with audio when a matching track exists.

- [x] Wire the existing format-table merge controls into single and queued downloads while preserving the exact video ID.
- [x] Associate extracted video/audio streams by content, offer automatic or manual audio selection in discovered sources, and mux through the existing staged downloader.
- [x] Verify real output streams with FFprobe, UI interactions, cancellation and existing contracts.
- [x] Update the local Windows application and project memory after verification.

Generic pages may contain unrelated media: automatically associate only extractor streams from the same entry; allow explicit audio selection for other sources. Keep raw stream download available. Use FFmpeg stream copy, preferring MP4/WebM for compatible tracks and MKV otherwise.
