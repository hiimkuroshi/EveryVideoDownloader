/* ═══════════════════════════════════════════════════════
   EveryVideoDownloader — Workstation Client Script (V5)
   Powered by yt-dlp
   ═══════════════════════════════════════════════════════ */

// ── Theme Management ──────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        htmlEl.setAttribute('data-theme', saved);
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        htmlEl.setAttribute('data-theme', 'light');
    }
})();

themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

// Fetch dynamic server configuration on load
fetch('/api/config')
  .then(r => r.json())
  .then(cfg => {
    if (cfg.downloadFolder) {
      if ($('quickDownloadFolder')) $('quickDownloadFolder').value = cfg.downloadFolder;
      if ($('downloadFolder')) $('downloadFolder').value = cfg.downloadFolder;
    }
  })
  .catch(() => {});

// ── Tab Navigation ───────────────────────────────────
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.add('active');
    });
});

// ── Helper Utilities ──────────────────────────────────
function $(id) { return document.getElementById(id); }
function val(id) { return $(id)?.value ?? ''; }
function checked(id) { return $(id)?.checked ?? false; }

function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes <= 0) return null;
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCodecBadgeClass(codec) {
    if (!codec || codec === 'none') return 'none';
    const c = codec.toLowerCase();
    if (c.includes('av01') || c.includes('av1')) return 'av1';
    if (c.includes('hvc1') || c.includes('hev1') || c.includes('265')) return 'hevc';
    if (c.includes('avc1') || c.includes('264')) return 'avc';
    if (c.includes('vp9') || c.includes('vp09')) return 'vp9';
    if (c.includes('mp4a') || c.includes('aac') || c.includes('opus') || c.includes('mp3')) return 'audio';
    return 'avc';
}

function getCodecName(codec, isVideo = true) {
    if (!codec || codec === 'none') return isVideo ? 'No Video' : 'No Audio';
    const c = codec.toLowerCase();
    if (c.includes('av01') || c.includes('av1')) return 'AV1 (' + codec.split('.')[0] + ')';
    if (c.includes('hvc1') || c.includes('hev1') || c.includes('265')) return 'HEVC / H.265';
    if (c.includes('avc1') || c.includes('264')) return 'AVC / H.264';
    if (c.includes('vp9') || c.includes('vp09')) return 'VP9';
    if (c.includes('mp4a.40.2') || c.includes('aac')) return 'AAC (' + codec + ')';
    if (c.includes('opus')) return 'Opus';
    if (c.includes('mp3')) return 'MP3';
    return codec;
}

// ── Accurate Platform Detection & Official Brand Logos ──
const PLATFORMS = {
    bilibili: {
        name: 'Bilibili',
        class: 'platform-bilibili',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.8 4.2h.9c1.5 0 2.7 1.2 2.7 2.7v10.2c0 1.5-1.2 2.7-2.7 2.7H4.3c-1.5 0-2.7-1.2-2.7-2.7V6.9c0-1.5 1.2-2.7 2.7-2.7h.9L3.8 2.8c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l2.5 2.5h9.2l2.5-2.5c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1L18.8 4.2zM4.3 6.2c-.4 0-.7.3-.7.7v10.2c0 .4.3.7.7.7h15.4c.4 0 .7-.3.7-.7V6.9c0-.4-.3-.7-.7-.7H4.3zm3.7 3.8c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3zm8 0c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.3 1.3-1.3z"/></svg>`
    },
    youtube: {
        name: 'YouTube',
        class: 'platform-youtube',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    tiktok: {
        name: 'TikTok',
        class: 'platform-tiktok',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
    },
    facebook: {
        name: 'Facebook',
        class: 'platform-facebook',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    },
    twitter: {
        name: 'X (Twitter)',
        class: 'platform-twitter',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    },
    instagram: {
        name: 'Instagram',
        class: 'platform-instagram',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
    },
    generic: {
        name: 'Web Media',
        class: 'platform-generic',
        icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
    }
};

function detectPlatform(url, extractor) {
    const u = (url || '').toLowerCase();
    const e = (extractor || '').toLowerCase();

    if (u.includes('bilibili.com') || u.includes('b23.tv') || e.includes('bilibili')) return PLATFORMS.bilibili;
    if (u.includes('youtube.com') || u.includes('youtu.be') || e.includes('youtube')) return PLATFORMS.youtube;
    if (u.includes('tiktok.com') || e.includes('tiktok')) return PLATFORMS.tiktok;
    if (u.includes('facebook.com') || u.includes('fb.watch') || e.includes('facebook')) return PLATFORMS.facebook;
    if (u.includes('twitter.com') || u.includes('x.com') || e.includes('twitter')) return PLATFORMS.twitter;
    if (u.includes('instagram.com') || e.includes('instagram')) return PLATFORMS.instagram;
    return PLATFORMS.generic;
}

function updatePlatformBadges(platform) {
    const badgeTop = $('platformBadgeTop');
    const iconTop = $('platformIconTop');
    const nameTop = $('platformNameTop');

    const badgeCard = $('platformBadgeCard');
    const iconCard = $('cardPlatformIcon');
    const nameCard = $('cardPlatformName');

    if (badgeTop) {
        badgeTop.className = `platform-badge ${platform.class}`;
        iconTop.innerHTML = platform.icon;
        nameTop.textContent = platform.name;
        badgeTop.classList.remove('hidden');
    }

    if (badgeCard) {
        badgeCard.className = `platform-pill-badge ${platform.class}`;
        iconCard.innerHTML = platform.icon;
        nameCard.textContent = platform.name;
    }
}

// ── State Variables ──────────────────────────────────
let currentUrl = '';
let currentBrowser = 'none';
let currentVideoData = null;
let currentThumbnailUrl = '';
let parsedFormats = [];
let audioOnlyFormats = [];
let currentTypeFilter = 'all';
let currentSearchQuery = '';
let selectedFormatValue = 'bv*+ba/b';
let selectedRawFormat = null;
let currentViewMode = 'table';

// 3-State Sorting State: 'none' (Default) -> 'desc' -> 'asc' -> 'none'
let currentSortField = null;
let currentSortState = 'none';

// Multi-select & Download Queue State
let selectedFormatSet = new Set();
let downloadQueue = [];
let isQueueProcessing = false;

// Active Download Control
let activeDownloadId = null;
let activeEventSource = null;
let isDownloadPaused = false;

// ── Open Storage Folder in Windows Explorer (Instant <10ms) ───
function openStorageFolder(customPath = null) {
    const targetFolder = customPath || val('quickDownloadFolder') || val('downloadFolder') || 'D:\\yt-dlp\\Download';
    showToast(`📂 Đang mở thư mục lưu trữ:\n${targetFolder}`, 'info');
    fetch(`/api/open-folder?path=${encodeURIComponent(targetFolder)}`).catch(() => {});
}

$('openStorageFolderBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openStorageFolder();
});

$('openFolderBtnSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    openStorageFolder();
});

$('openFolderBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openStorageFolder();
});

// ── Directory Picker Handlers (Windows STA Native) ───
async function triggerFolderBrowser(targetInputId) {
    try {
        showToast('📂 Đang mở hộp thoại chọn thư mục Windows...', 'info');
        const currentPath = val(targetInputId) || val('quickDownloadFolder') || val('downloadFolder') || 'D:\\yt-dlp\\Download';
        const res = await fetch(`/api/browse-folder?current=${encodeURIComponent(currentPath)}`);
        const data = await res.json();
        if (data.success && data.path) {
            $(targetInputId).value = data.path;
            if (targetInputId === 'quickDownloadFolder') {
                if ($('downloadFolder')) $('downloadFolder').value = data.path;
            } else {
                if ($('quickDownloadFolder')) $('quickDownloadFolder').value = data.path;
            }
            showToast(`✅ Đã chọn thư mục: ${data.path}`, 'success');
        } else {
            showToast('Đã hủy chọn thư mục.', 'info');
        }
    } catch (err) {
        showToast('Không thể mở hộp thoại chọn thư mục Windows', 'error');
    }
}

$('browseFolderBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerFolderBrowser('quickDownloadFolder');
});

$('browseFolderBtnSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerFolderBrowser('downloadFolder');
});

// ── Update Download Button Enabled / Disabled State ──
function updateDownloadButtonState() {
    const hasUrl = !!currentUrl;
    const hasSelectedRow = !!selectedRawFormat;
    const hasCheckedOptions = selectedFormatSet.size > 0;
    const hasPresetOrCustom = (currentViewMode === 'cards' && !!selectedFormatValue) || 
                              (!($('customFormatInput')?.classList.contains('hidden')) && !!$('customFormatInput')?.value.trim());

    // Download button is enabled ONLY when URL is present AND at least 1 option is chosen
    const canDownload = hasUrl && (hasSelectedRow || hasCheckedOptions || hasPresetOrCustom);

    const dlBtn = $('downloadBtn');
    if (dlBtn && !activeEventSource) {
        dlBtn.disabled = !canDownload;
    }
}

// ── Check Info & Fetch Formats ───────────────────────
$('checkBtn').addEventListener('click', async () => {
    const url = val('url').trim();
    const browser = val('browser');
    if (!url) { $('url').focus(); return; }

    currentUrl = url;
    currentBrowser = browser;

    const platform = detectPlatform(url);
    updatePlatformBadges(platform);

    const checkBtn = $('checkBtn');
    const loadingInfo = $('loadingInfo');
    const emptyCard = $('emptyHeroCard');

    $('statusArea').classList.add('hidden');
    $('downloadSuccessAlert')?.classList.add('hidden');
    $('openFolderBtn')?.classList.add('hidden');
    checkBtn.disabled = true;
    loadingInfo.classList.remove('hidden');

    try {
        const qp = new URLSearchParams({ url });
        if (browser !== 'none') qp.append('browser', browser);

        const res = await fetch(`/api/info?${qp}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi tải thông tin video.');

        currentVideoData = data;
        const actualPlatform = detectPlatform(url, data.extractor || data.extractor_key);
        updatePlatformBadges(actualPlatform);

        renderVideoHero(data);
        if (emptyCard) emptyCard.classList.add('hidden');
        
        handlePlaylistDisplay(data);
        processAndRenderFormats(data.formats || []);
        translateVideoTitle(data.title);

        // Enable download buttons once options/formats are successfully loaded
        updateDownloadButtonState();

        showToast(`🎉 Phân tích thành công! Đã tìm thấy ${data.formats?.length || 0} formats.`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
        updateDownloadButtonState();
    } finally {
        checkBtn.disabled = false;
        loadingInfo.classList.add('hidden');
    }
});

// Allow pressing Enter in URL field
$('url').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('checkBtn').click(); }
});

$('url').addEventListener('input', (e) => {
    const platform = detectPlatform(e.target.value.trim());
    if (e.target.value.trim()) {
        updatePlatformBadges(platform);
    }
});

// ── Render Video Hero Card ───────────────────────────
function renderVideoHero(data) {
    const card = $('videoHeroCard');
    const thumb = $('videoThumb');
    const durBadge = $('videoDurationBadge');
    const title = $('videoTitle');
    const uploader = $('videoUploader').querySelector('.text');
    const views = $('videoViews').querySelector('.text');
    const fmtCount = $('videoFormatCount').querySelector('.text');

    currentThumbnailUrl = data.thumbnail || '';

    // Proxy image with fallback
    if (currentThumbnailUrl) {
        thumb.src = `/api/proxy-image?url=${encodeURIComponent(currentThumbnailUrl)}`;
        thumb.onerror = () => { thumb.src = currentThumbnailUrl; };
    } else {
        thumb.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="0 0 160 90"><rect width="160" height="90" fill="%23111726"/><text x="50%" y="50%" fill="%2364748B" font-size="12" text-anchor="middle" dominant-baseline="middle">No Thumbnail</text></svg>';
    }

    durBadge.textContent = data.duration_string || formatDuration(data.duration) || 'LIVE / N/A';
    title.textContent = data.title || 'Không có tiêu đề';
    uploader.textContent = data.uploader || data.channel || data.extractor_key || 'Kênh nguồn';
    views.textContent = data.view_count ? Number(data.view_count).toLocaleString() + ' views' : 'Video';
    fmtCount.textContent = (data.formats?.length || 0) + ' Formats';

    card.classList.remove('hidden');
}

// ── Google Translate Title into Vietnamese ───────────
async function translateVideoTitle(rawTitle) {
    const transText = $('videoTranslatedTitle');
    if (!rawTitle || !transText) return;

    transText.textContent = 'Đang dịch tiêu đề sang tiếng Việt...';

    try {
        const res = await fetch(`/api/translate?text=${encodeURIComponent(rawTitle)}&to=vi`);
        const data = await res.json();
        if (data.translated) {
            transText.textContent = data.translated;
        } else {
            transText.textContent = rawTitle;
        }
    } catch (err) {
        transText.textContent = rawTitle;
    }
}

// ── Single Thumbnail Download Action ─────────────────
$('dlThumbBtn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!currentUrl && !currentThumbnailUrl) {
        showToast('Chưa có thông tin video để tải ảnh thumbnail', 'error');
        return;
    }

    const btn = $('dlThumbBtn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-block; animation:spin 0.6s linear infinite;">⏳</span> <span>Đang lưu...</span>`;

    const targetFolder = val('quickDownloadFolder') || val('downloadFolder') || 'D:\\yt-dlp\\Download';
    showToast('⏳ Đang tải ảnh thumbnail HD của video...', 'info');

    try {
        const qp = new URLSearchParams({
            url: currentUrl,
            thumbUrl: currentThumbnailUrl || '',
            title: currentVideoData?.title || 'video',
            browser: currentBrowser,
            output: targetFolder
        });

        const res = await fetch(`/api/download-thumbnail?${qp}`);
        const data = await res.json();

        if (res.ok && data.success) {
            showToast(`🎉 Đã tải ảnh thumbnail HD thành công!\nĐã lưu vào: ${targetFolder}`, 'success');
        } else {
            showToast(`⚠️ Không thể tải trực tiếp: ${data.error || 'Lỗi'}`, 'error');
            if (currentThumbnailUrl) {
                window.open(`/api/proxy-image?url=${encodeURIComponent(currentThumbnailUrl)}`, '_blank');
            }
        }
    } catch (err) {
        showToast('Lỗi khi kết nối tải thumbnail', 'error');
        if (currentThumbnailUrl) {
            window.open(`/api/proxy-image?url=${encodeURIComponent(currentThumbnailUrl)}`, '_blank');
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
});

// ── Handle Playlist Detection & Display ──────────────
function handlePlaylistDisplay(data) {
    const banner = $('playlistBanner');
    const list = $('playlistItemsScroll');
    const titleText = $('playlistTitleText');
    const countBadge = $('playlistCountBadge');

    if (data._type === 'playlist' || (data.entries && Array.isArray(data.entries) && data.entries.length > 0)) {
        const entries = data.entries || [];
        banner.classList.remove('hidden');
        titleText.textContent = data.title || 'Danh Sách Phát (Playlist)';
        countBadge.textContent = `${entries.length} videos`;
        $('playlist').checked = true;

        list.innerHTML = '';
        entries.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'playlist-item-row';
            row.innerHTML = `
                <span class="playlist-item-index">#${idx + 1}</span>
                <span class="playlist-item-title">${item.title || 'Untitled item'}</span>
                <span style="color: var(--fg-muted); font-size: 0.72rem;">${item.duration_string || formatDuration(item.duration) || ''}</span>
            `;
            list.appendChild(row);
        });
    } else {
        banner.classList.add('hidden');
    }
}

// ── Process & Categorize Formats ──────────────────────
function processAndRenderFormats(formats) {
    parsedFormats = [];
    audioOnlyFormats = [];
    selectedFormatSet.clear();
    currentSortField = null;
    currentSortState = 'none';

    document.querySelectorAll('th.th-sortable').forEach(t => {
        t.classList.remove('sorted-asc', 'sorted-desc');
        t.querySelector('.sort-icon').textContent = '↕';
    });

    formats.forEach((f, idx) => {
        const isAudioOnly = f.resolution === 'audio only' || f.vcodec === 'none' || (f.audio_ext !== 'none' && f.video_ext === 'none');
        const isVideoOnly = !isAudioOnly && (f.acodec === 'none' || !f.acodec || f.acodec === null);
        const isCombo = !isAudioOnly && !isVideoOnly;

        let type = 'video';
        if (isAudioOnly) type = 'audio';
        else if (isCombo) type = 'combo';

        let sizeFormatted = '-';
        let rawBytes = 0;
        if (f.filesize) {
            rawBytes = f.filesize;
            sizeFormatted = formatBytes(f.filesize);
        } else if (f.filesize_approx) {
            rawBytes = f.filesize_approx;
            sizeFormatted = '~' + formatBytes(f.filesize_approx);
        } else if (f.tbr && currentVideoData?.duration) {
            rawBytes = (f.tbr * 1000 / 8) * currentVideoData.duration;
            sizeFormatted = '~' + formatBytes(rawBytes);
        }

        let resText = f.resolution || '';
        let heightVal = f.height || 0;
        if (!resText && f.width && f.height) resText = `${f.width}x${f.height}`;
        if (isAudioOnly && !resText) { resText = 'Audio Only'; heightVal = 0; }

        const item = {
            raw: f,
            rawIndex: idx,
            id: f.format_id,
            idNum: parseInt(f.format_id, 10) || idx,
            ext: (f.ext || 'mp4').toLowerCase(),
            type: type,
            resolution: resText,
            height: heightVal,
            fps: f.fps ? `${f.fps}fps` : '-',
            fpsNum: f.fps || 0,
            vcodec: f.vcodec || 'none',
            acodec: f.acodec || 'none',
            tbr: f.tbr ? `${Math.round(f.tbr)}k` : null,
            tbrNum: f.tbr || 0,
            vbr: f.vbr ? `${Math.round(f.vbr)}k` : null,
            abr: f.abr ? `${Math.round(f.abr)}k` : null,
            size: sizeFormatted,
            rawBytes: rawBytes,
            note: f.format_note || f.format || f.dynamic_range || (isAudioOnly ? 'Audio Track' : 'Standard'),
            protocol: f.protocol || ''
        };

        parsedFormats.push(item);
        if (isAudioOnly) {
            audioOnlyFormats.push(item);
        }
    });

    $('countAll').textContent = parsedFormats.length;
    $('countVideo').textContent = parsedFormats.filter(f => f.type === 'video').length;
    $('countAudio').textContent = audioOnlyFormats.length;
    $('countCombo').textContent = parsedFormats.filter(f => f.type === 'combo').length;

    populateAudioMergeDropdown();
    renderFormatTable();
    renderPresetCards();
    updateMultiSelectBar();

    // Reset selection so user must explicitly choose an option
    selectedRawFormat = null;
    selectedFormatSet.clear();
    selectedFormatValue = null;
    $('formatPreviewCode').textContent = '(Chưa chọn định dạng - Vui lòng chọn 1 dòng)';
    if ($('customFormatInput')) $('customFormatInput').value = '';

    updateDownloadButtonState();
}

// ── Populate Audio Select for Smart Merge ────────────
function populateAudioMergeDropdown() {
    const select = $('selectedAudioTrack');
    select.innerHTML = '<option value="bestaudio/best">🌟 Best Audio (Tự động chọn âm thanh tốt nhất)</option>';

    audioOnlyFormats.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        const abr = a.abr || a.tbr || '';
        opt.textContent = `ID ${a.id}: ${a.ext.toUpperCase()} · ${a.size} · ${getCodecName(a.acodec, false)} (${abr})`;
        select.appendChild(opt);
    });
}

// ── 3-State Sorting Logic: Desc -> Asc -> Default ────
document.querySelectorAll('th.th-sortable').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.dataset.sort;

        if (currentSortField === field) {
            if (currentSortState === 'desc') {
                currentSortState = 'asc';
            } else if (currentSortState === 'asc') {
                currentSortState = 'none';
                currentSortField = null;
            } else {
                currentSortState = 'desc';
            }
        } else {
            currentSortField = field;
            currentSortState = 'desc';
        }

        document.querySelectorAll('th.th-sortable').forEach(t => {
            t.classList.remove('sorted-asc', 'sorted-desc');
            t.querySelector('.sort-icon').textContent = '↕';
        });

        if (currentSortState === 'desc') {
            th.classList.add('sorted-desc');
            th.querySelector('.sort-icon').textContent = '▼';
        } else if (currentSortState === 'asc') {
            th.classList.add('sorted-asc');
            th.querySelector('.sort-icon').textContent = '▲';
        }

        sortAndRenderFormatTable();
    });
});

function sortAndRenderFormatTable() {
    if (currentSortState === 'none' || !currentSortField) {
        parsedFormats.sort((a, b) => a.rawIndex - b.rawIndex);
    } else {
        parsedFormats.sort((a, b) => {
            let valA = a[currentSortField];
            let valB = b[currentSortField];

            if (currentSortField === 'id') {
                valA = a.idNum;
                valB = b.idNum;
            } else if (currentSortField === 'resolution') {
                valA = a.height;
                valB = b.height;
            } else if (currentSortField === 'fps') {
                valA = a.fpsNum;
                valB = b.fpsNum;
            } else if (currentSortField === 'bitrate') {
                valA = a.tbrNum;
                valB = b.tbrNum;
            } else if (currentSortField === 'size') {
                valA = a.rawBytes;
                valB = b.rawBytes;
            }

            if (valA < valB) return currentSortState === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortState === 'asc' ? 1 : -1;
            return 0;
        });
    }

    renderFormatTable();
}

// ── Render Format Table Rows ─────────────────────────
function renderFormatTable() {
    const tbody = $('formatsTableBody');
    tbody.innerHTML = '';

    const filtered = parsedFormats.filter(item => {
        if (currentTypeFilter !== 'all' && item.type !== currentTypeFilter) {
            return false;
        }
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            const match = item.id.toLowerCase().includes(q) ||
                          item.resolution.toLowerCase().includes(q) ||
                          item.ext.toLowerCase().includes(q) ||
                          item.vcodec.toLowerCase().includes(q) ||
                          item.acodec.toLowerCase().includes(q) ||
                          item.note.toLowerCase().includes(q);
            if (!match) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 36px; color: var(--fg-muted);">
                    Không tìm thấy format nào phù hợp với bộ lọc tìm kiếm.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'format-row';
        tr.dataset.id = item.id;
        tr.dataset.type = item.type;

        if (selectedRawFormat?.id === item.id) {
            tr.classList.add('selected');
        }

        let bitrateText = item.tbr || (item.vbr ? item.vbr + ' (V)' : '') || (item.abr ? item.abr + ' (A)' : '-');
        let extClass = item.ext === 'mp4' ? 'ext-mp4' : item.ext === 'm4a' ? 'ext-m4a' : 'ext-webm';
        let vcodecClass = getCodecBadgeClass(item.vcodec);
        let acodecClass = getCodecBadgeClass(item.acodec);
        let typeIcon = item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '🎥';
        const isChecked = selectedFormatSet.has(item.id);

        tr.innerHTML = `
            <td class="td-checkbox" style="text-align:center;">
                <input type="checkbox" class="row-checkbox" value="${item.id}" ${isChecked ? 'checked' : ''}>
            </td>
            <td><span class="id-badge">${item.id}</span></td>
            <td><span class="res-text">${typeIcon} ${item.resolution}</span></td>
            <td><span class="badge-tag ${extClass}">${item.ext}</span></td>
            <td><span class="fps-text">${item.fps}</span></td>
            <td><span class="codec-tag ${vcodecClass}">${getCodecName(item.vcodec, true)}</span></td>
            <td><span class="codec-tag ${acodecClass}">${getCodecName(item.acodec, false)}</span></td>
            <td><span class="bitrate-text">${bitrateText}</span></td>
            <td><span class="size-text">${item.size}</span></td>
            <td><span class="meta-note" style="color: var(--fg-muted); font-size: 0.74rem;">${item.note}</span></td>
        `;

        // Checkbox click handler
        const chk = tr.querySelector('.row-checkbox');
        chk.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chk.checked) {
                selectedFormatSet.add(item.id);
                if (selectedFormatSet.size === 1) {
                    selectFormatFromTable(item);
                } else {
                    selectedRawFormat = null;
                    tr.classList.add('selected');
                    setFinalFormat(item.id, `Đã chọn ${selectedFormatSet.size} định dạng`);
                    updateMultiSelectBar();
                    updateDownloadButtonState();
                }
            } else {
                selectedFormatSet.delete(item.id);
                tr.classList.remove('selected');
                if (selectedFormatSet.size === 0) {
                    selectedRawFormat = null;
                    selectedFormatValue = null;
                    $('formatPreviewCode').textContent = '(Chưa chọn định dạng - Vui lòng chọn 1 dòng)';
                    if ($('customFormatInput')) $('customFormatInput').value = '';
                } else {
                    const remainingId = Array.from(selectedFormatSet)[0];
                    const remainingItem = parsedFormats.find(f => f.id === remainingId);
                    if (remainingItem) selectFormatFromTable(remainingItem);
                }
                updateMultiSelectBar();
                updateDownloadButtonState();
            }
        });

        // Row select click handler
        tr.addEventListener('click', () => {
            selectFormatFromTable(item);
        });

        tbody.appendChild(tr);
    });

    updateMultiSelectBar();
    updateDownloadButtonState();
}

// ── Multi-select Helpers (Fixed Toolbar) ─────────────
$('selectAllCheckbox')?.addEventListener('change', (e) => {
    const checkedState = e.target.checked;
    document.querySelectorAll('.row-checkbox').forEach(chk => {
        chk.checked = checkedState;
        if (checkedState) {
            selectedFormatSet.add(chk.value);
        } else {
            selectedFormatSet.delete(chk.value);
        }
    });
    document.querySelectorAll('.format-row').forEach(r => {
        r.classList.toggle('selected', checkedState);
    });
    if (checkedState && parsedFormats.length > 0) {
        selectedRawFormat = parsedFormats[0];
        setFinalFormat(parsedFormats[0].id, `Đã chọn tất cả (${parsedFormats.length} định dạng)`);
    } else {
        selectedRawFormat = null;
        selectedFormatValue = null;
        $('formatPreviewCode').textContent = '(Chưa chọn định dạng - Vui lòng chọn 1 dòng)';
        if ($('customFormatInput')) $('customFormatInput').value = '';
    }
    updateMultiSelectBar();
    updateDownloadButtonState();
});

function updateMultiSelectBar() {
    const countText = $('selectedCountText');
    const addBtn = $('addSelectedToQueueBtn');
    if (countText) countText.textContent = selectedFormatSet.size;
    if (addBtn) addBtn.disabled = selectedFormatSet.size === 0;
}

// ── Select Format from Table ─────────────────────────
function selectFormatFromTable(item) {
    selectedRawFormat = item;
    selectedFormatSet.clear();
    selectedFormatSet.add(item.id);

    // Highlight selected row & sync checkbox
    document.querySelectorAll('.format-row').forEach(r => {
        const isCurrent = (r.dataset.id === item.id);
        r.classList.toggle('selected', isCurrent);
        const chk = r.querySelector('.row-checkbox');
        if (chk) chk.checked = isCurrent;
    });

    document.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));

    // Directly set format to exact ID selected by user (e.g. "30080")
    setFinalFormat(item.id, `${item.resolution} (ID ${item.id})`);

    updateMultiSelectBar();
    updateDownloadButtonState();
}

// ── Render Quick Preset Cards ─────────────────────────
function renderPresetCards() {
    const list = $('presetCardsContainer');
    list.innerHTML = '';

    const presets = [
        {
            value: 'bv*+ba/b',
            title: '🌟 Chất Lượng Tốt Nhất (Best Video + Best Audio)',
            desc: 'Tự động tải video độ phân giải cao nhất và ghép với âm thanh tốt nhất'
        },
        {
            value: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            title: '🎬 Chuẩn MP4 / H.264 (Tương thích mọi thiết bị)',
            desc: 'Định dạng MP4 và AAC tương thích hoàn hảo trên TV, iPhone, Android, PC'
        },
        {
            value: 'bestaudio/best',
            title: '🎵 Chỉ Tải Âm Thanh (Best Audio Only)',
            desc: 'Trích xuất bài hát / podcast với chất lượng âm thanh cao nhất'
        },
        {
            value: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
            title: '📱 Tiết Kiệm Dung Lượng (720p HD Balanced)',
            desc: 'Độ phân giải 720p HD nhẹ, tải nhanh, phù hợp lưu trữ điện thoại'
        }
    ];

    presets.forEach((p, i) => {
        const card = document.createElement('label');
        card.className = 'format-card' + (i === 0 ? ' selected' : '');
        card.innerHTML = `
            <input type="radio" name="presetRadio" value="${p.value}" ${i === 0 ? 'checked' : ''}>
            <div class="format-info">
                <span class="format-label">${p.title}</span>
                <span class="format-meta">${p.desc}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedRawFormat = null;
            document.querySelectorAll('.format-row').forEach(r => r.classList.remove('selected'));
            $('audioMergeHelperBox').classList.add('hidden');
            setFinalFormat(p.value, p.title);
            updateDownloadButtonState();
        });

        list.appendChild(card);
    });
}

// ── Set Final Format & Update Live Code Preview ───────
function setFinalFormat(formatString, summaryLabel) {
    selectedFormatValue = formatString;
    $('formatPreviewCode').textContent = `-f "${formatString}"`;
    $('customFormatInput').value = formatString;
    $('downloadBtnText').textContent = 'Bắt Đầu Tải Xuống';
}

// ── Filter Toolbar Event Listeners ────────────────────
$('typeFilterPills').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    currentTypeFilter = btn.dataset.filter;
    renderFormatTable();
});

$('formatSearchInput').addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim();
    renderFormatTable();
});

// ── View Mode Switcher (Table vs Cards) ───────────────
document.querySelectorAll('.mode-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentViewMode = btn.dataset.mode;

        if (currentViewMode === 'cards') {
            $('tableModeContainer').classList.add('hidden');
            $('presetCardsContainer').classList.remove('hidden');
        } else {
            $('presetCardsContainer').classList.add('hidden');
            $('tableModeContainer').classList.remove('hidden');
        }
    });
});

// ── Manual Format String Edit Toggle ──────────────────
$('editFormatManualBtn').addEventListener('click', () => {
    const codeEl = $('formatPreviewCode');
    const inputEl = $('customFormatInput');

    if (inputEl.classList.contains('hidden')) {
        codeEl.classList.add('hidden');
        inputEl.classList.remove('hidden');
        inputEl.focus();
        inputEl.select();
    } else {
        inputEl.classList.add('hidden');
        codeEl.classList.remove('hidden');
        setFinalFormat(inputEl.value.trim() || 'bv*+ba/b', null);
    }
});

$('customFormatInput').addEventListener('input', (e) => {
    selectedFormatValue = e.target.value.trim();
    $('formatPreviewCode').textContent = `-f "${selectedFormatValue}"`;
    updateDownloadButtonState();
});

// ── Sync Quick Options & Advanced Tab Options ────────
function bindTwoWaySync(id1, id2) {
    const el1 = $(id1);
    const el2 = $(id2);
    if (!el1 || !el2) return;
    el1.addEventListener('change', () => { el2.value = el1.value; });
    el2.addEventListener('change', () => { el1.value = el2.value; });
}

bindTwoWaySync('quickMergeFormat', 'mergeOutputFormat');
bindTwoWaySync('quickConcurrentFragments', 'concurrentFragments');
bindTwoWaySync('quickHttpChunkSize', 'httpChunkSize');
bindTwoWaySync('quickDownloadFolder', 'downloadFolder');

// ── Toggle Log Console ───────────────────────────────
$('toggleLogsBtn')?.addEventListener('click', () => {
    $('logsContainer')?.classList.toggle('hidden');
});

// ── Download Execution & SSE Progress with Pause/Resume/Cancel ──
$('downloadBtn').addEventListener('click', () => {
    startDirectDownload();
});

function startDirectDownload(customParams = null) {
    if (!currentUrl && !customParams?.url) {
        showToast('Vui lòng nhập URL video và bấm "Phân Tích (-F)"', 'error');
        $('url').focus();
        return;
    }

    // Read active browser selection
    const activeBrowser = val('browser') || currentBrowser || 'none';

    // If user selected multiple formats via checkboxes, add to queue and download all
    if (selectedFormatSet.size > 1 && !customParams) {
        let addedCount = 0;
        selectedFormatSet.forEach(fmtId => {
            const item = parsedFormats.find(f => f.id === fmtId);
            if (item) {
                addSingleItemToQueue({
                    url: currentUrl,
                    title: currentVideoData?.title || 'Video',
                    format: item.id,
                    formatLabel: `${item.resolution} (ID ${item.id})`,
                    ext: item.ext,
                    size: item.size
                });
                addedCount++;
            }
        });
        selectedFormatSet.clear();
        document.querySelectorAll('.row-checkbox').forEach(chk => { chk.checked = false; });
        if ($('selectAllCheckbox')) $('selectAllCheckbox').checked = false;
        updateMultiSelectBar();
        showToast(`Đã thêm ${addedCount} định dạng đã chọn vào Hàng Chờ và bắt đầu tải...`, 'success');
        processNextQueueItem();
        return;
    }

    // Determine finalFormat with strict priority: Custom Input -> Selected Raw Format -> Single Checkbox -> Selected Preset
    let finalFormat = null;
    if (!$('customFormatInput').classList.contains('hidden') && $('customFormatInput').value.trim()) {
        finalFormat = $('customFormatInput').value.trim();
    } else if (selectedRawFormat) {
        finalFormat = selectedRawFormat.id;
    } else if (selectedFormatSet.size === 1) {
        finalFormat = Array.from(selectedFormatSet)[0];
    } else if (selectedFormatValue) {
        finalFormat = selectedFormatValue;
    }

    if (!finalFormat) {
        showToast('Vui lòng chọn ít nhất một định dạng (option) để tải xuống!', 'warning');
        return;
    }

    const currentSaveDir = val('quickDownloadFolder') || val('downloadFolder') || 'D:\\yt-dlp\\Download';

    const params = {
        url: currentUrl,
        format: finalFormat,
        playlist:           checked('playlist'),
        subtitles:          checked('subtitles'),
        thumbnail:          checked('thumbnail'),
        metadata:           checked('metadata'),
        geo_bypass:         checked('geoBypass'),
        force_ipv4:         checked('forceIpv4'),
        restrict_filenames: checked('restrictFilenames'),
        no_overwrites:      checked('noOverwrites'),
    };

    const optionals = {
        browser:              activeBrowser !== 'none' ? activeBrowser : '',
        rate_limit:           val('rateLimit'),
        username:             val('username'),
        password:             val('password'),
        output_template:      val('outputTemplate'),
        output:               currentSaveDir,
        user_agent:           val('userAgent'),
        proxy:                val('proxy'),
        convert_thumbnails:   val('convertThumbnails') !== 'none' ? val('convertThumbnails') : '',
        sponsorblock_mark:    val('sponsorblockMark'),
        extractor_retries:    val('extractorRetries'),
        concurrent_fragments: val('quickConcurrentFragments') || val('concurrentFragments') || '8',
        http_chunk_size:      val('quickHttpChunkSize') || val('httpChunkSize') || '10M',
        audio_format:         val('audioFormat'),
        audio_quality:        val('audioQuality'),
        recode_video:         val('recodeVideo'),
        merge_output_format:  val('quickMergeFormat') || val('mergeOutputFormat') || 'mkv',
    };

    if (customParams) {
        Object.assign(params, customParams);
    } else {
        for (const [k, v] of Object.entries(optionals)) {
            if (v) params[k] = v;
        }
    }

    const qp = new URLSearchParams(params);

    const dlBtn = $('downloadBtn');
    const statusArea = $('statusArea');
    const logs = $('logsContainer');
    const bar = $('progressBar');
    const statusText = $('statusText');
    const badge = $('statusBadge');
    const percentCounter = $('progressPercentCounter');
    const pauseResumeBtn = $('pauseResumeBtn');
    const pauseResumeBtnText = $('pauseResumeBtnText');
    const cancelBtn = $('cancelBtn');
    const openFolderBtn = $('openFolderBtn');
    const successBox = $('downloadSuccessAlert');

    dlBtn.disabled = true;
    dlBtn.innerHTML = `<div class="btn-spinner"></div> <span>Đang tải...</span>`;
    statusArea.classList.remove('hidden');
    if (successBox) successBox.classList.add('hidden');
    if (openFolderBtn) openFolderBtn.classList.add('hidden');
    logs.innerHTML = '';
    bar.style.width = '0%';
    percentCounter.textContent = '0.0%';
    statusText.textContent = 'Đang kết nối máy chủ...';
    badge.textContent = 'Downloading';
    badge.className = 'status-badge active';
    
    pauseResumeBtn.disabled = false;
    pauseResumeBtnText.textContent = 'Tạm Dừng';
    cancelBtn.disabled = false;
    isDownloadPaused = false;

    if (activeEventSource) {
        activeEventSource.close();
    }

    const es = new EventSource(`/api/download?${qp}`);
    activeEventSource = es;

    es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.downloadId) {
            activeDownloadId = data.downloadId;
        }

        if (data.done) {
            es.close();
            activeEventSource = null;
            dlBtn.disabled = false;
            dlBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> <span id="downloadBtnText">Bắt Đầu Tải Xuống</span>`;
            
            if (data.code === 0) {
                statusText.textContent = '🎉 Tải xuống hoàn tất 100%!';
                badge.textContent = 'Complete';
                badge.className = 'status-badge success';
                bar.style.width = '100%';
                percentCounter.textContent = '100%';
                
                // Show Prominent Success Alert Box
                if (successBox) successBox.classList.remove('hidden');
                const savePathEl = $('successSavePathText');
                if (savePathEl) savePathEl.textContent = `File đã lưu an toàn tại: ${currentSaveDir}`;

                // Show Open Folder Button
                if (openFolderBtn) openFolderBtn.classList.remove('hidden');
                
                // Disable Pause and Cancel buttons on successful completion
                pauseResumeBtn.disabled = true;
                cancelBtn.disabled = true;

                showToast(`🎉 Tải video hoàn tất 100%!\nĐã lưu vào: ${currentSaveDir}`, 'success');
            } else {
                if (!isDownloadPaused) {
                    statusText.textContent = `Thoát với mã lỗi: ${data.code}`;
                    badge.textContent = 'Error';
                    badge.className = 'status-badge error';
                    showToast(`Tải xuống gián đoạn (Exit code ${data.code}).`, 'error');
                }
            }
            return;
        }

        const line = data.output || data.error || data.text || '';
        if (!line) return;

        const isError = !!data.error;
        appendLog(isError ? `[ERROR] ${line}` : line);

        if (!isError) {
            // Parse yt-dlp percentage, speed, ETA, and size
            const matchPct = line.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (matchPct) {
                const pct = parseFloat(matchPct[1]);
                bar.style.width = `${pct}%`;
                percentCounter.textContent = `${pct.toFixed(1)}%`;
                statusText.textContent = `Đang tải: ${pct.toFixed(1)}%`;

                const speedMatch = line.match(/at\s+([0-9\.]+[A-Za-z\/]+)/);
                if (speedMatch) $('metricSpeed').textContent = `⚡ Tốc độ: ${speedMatch[1]}`;

                const etaMatch = line.match(/ETA\s+([0-9:]+)/);
                if (etaMatch) $('metricEta').textContent = `⏱️ Còn lại: ${etaMatch[1]}`;

                const sizeMatch = line.match(/of\s+~?([0-9\.]+[A-Za-z]+)/);
                if (sizeMatch) $('metricSize').textContent = `📦 Kích thước: ${sizeMatch[1]}`;
            } else if (line.includes('[ExtractAudio]')) {
                statusText.textContent = 'Đang trích xuất audio...';
                badge.textContent = 'Extracting';
            } else if (line.includes('[Merger]')) {
                statusText.textContent = 'Đang ghép video và audio (FFmpeg)...';
                badge.textContent = 'Merging';
                bar.style.width = '95%';
                percentCounter.textContent = '95.0%';
            } else if (line.includes('[EmbedSubtitle]')) {
                statusText.textContent = 'Đang nhúng phụ đề...';
            } else if (line.includes('[EmbedThumbnail]')) {
                statusText.textContent = 'Đang nhúng ảnh bìa...';
            }
        }
    };

    es.onerror = () => {
        es.close();
        activeEventSource = null;
        dlBtn.disabled = false;
        dlBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> <span id="downloadBtnText">Bắt Đầu Tải Xuống</span>`;
        if (!isDownloadPaused) {
            statusText.textContent = 'Mất kết nối tiến trình tải.';
            badge.textContent = 'Stopped';
            badge.className = 'status-badge error';
        }
    };
}

// ── Separate Pause / Resume Button Handler ────────────
$('pauseResumeBtn')?.addEventListener('click', async () => {
    if (!isDownloadPaused && activeDownloadId && activeEventSource) {
        // Perform Pause
        isDownloadPaused = true;
        activeEventSource.close();
        activeEventSource = null;

        try {
            await fetch(`/api/cancel-download?downloadId=${encodeURIComponent(activeDownloadId)}`);
        } catch (e) {}

        $('statusBadge').textContent = 'Paused';
        $('statusBadge').className = 'status-badge';
        $('statusText').textContent = '⏸️ Đã tạm dừng tiến trình tải.';
        $('pauseResumeBtnText').textContent = 'Tiếp Tục';
        $('downloadBtn').disabled = false;
        $('downloadBtn').innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> <span id="downloadBtnText">Bắt Đầu Tải Xuống</span>`;
        showToast('⏸️ Đã tạm dừng tải. Bấm "Tiếp Tục" để resume.', 'info');
    } else if (isDownloadPaused) {
        // Perform Resume
        isDownloadPaused = false;
        $('pauseResumeBtnText').textContent = 'Tạm Dừng';
        showToast('▶️ Đang tiếp tục tải xuống...', 'info');
        startDirectDownload();
    }
});

// ── Separate Cancel Button Handler (With State Reset) ─
$('cancelBtn')?.addEventListener('click', async () => {
    if (activeDownloadId) {
        try {
            await fetch(`/api/cancel-download?downloadId=${encodeURIComponent(activeDownloadId)}`);
        } catch (e) {}
    }

    if (activeEventSource) {
        activeEventSource.close();
        activeEventSource = null;
    }

    isDownloadPaused = false;
    
    // Disable Cancel & Pause buttons
    $('pauseResumeBtn').disabled = true;
    $('cancelBtn').disabled = true;
    
    // Reset all loading metrics to initial clean state
    $('progressBar').style.width = '0%';
    $('progressPercentCounter').textContent = '0.0%';
    $('metricSpeed').textContent = '⚡ Tốc độ: --';
    $('metricEta').textContent = '⏱️ Còn lại: --';
    $('metricSize').textContent = '📦 Dung lượng: --';
    $('statusBadge').textContent = 'Đã hủy';
    $('statusBadge').className = 'status-badge error';
    $('statusText').textContent = 'Đã hủy tiến trình tải. Sẵn sàng tải mới.';
    $('pauseResumeBtnText').textContent = 'Tạm Dừng';
    $('downloadSuccessAlert')?.classList.add('hidden');
    $('openFolderBtn')?.classList.add('hidden');

    // Re-enable download trigger button
    $('downloadBtn').disabled = false;
    $('downloadBtn').innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> <span id="downloadBtnText">Bắt Đầu Tải Xuống</span>`;
    updateDownloadButtonState();

    showToast('❌ Đã hủy bỏ tiến trình tải xuống.', 'error');
});

// ── Download Queue Operations ────────────────────────

$('addSelectedToQueueBtn')?.addEventListener('click', () => {
    if (selectedFormatSet.size === 0) return;

    let addedCount = 0;
    selectedFormatSet.forEach(fmtId => {
        const item = parsedFormats.find(f => f.id === fmtId);
        if (item) {
            addSingleItemToQueue({
                url: currentUrl,
                title: currentVideoData?.title || 'Video',
                format: item.id,
                formatLabel: `${item.resolution} (ID ${item.id})`,
                ext: item.ext,
                size: item.size
            });
            addedCount++;
        }
    });

    selectedFormatSet.clear();
    document.querySelectorAll('.row-checkbox').forEach(chk => { chk.checked = false; });
    if ($('selectAllCheckbox')) $('selectAllCheckbox').checked = false;
    updateMultiSelectBar();

    showToast(`Đã thêm ${addedCount} format vào Hàng Chờ!`, 'success');
});

function addSingleItemToQueue(item) {
    const queueItem = {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        url: item.url,
        title: item.title,
        format: item.format,
        formatLabel: item.formatLabel,
        ext: item.ext,
        size: item.size,
        status: 'waiting', // 'waiting', 'downloading', 'done', 'error'
    };

    downloadQueue.push(queueItem);
    updateQueueUI();
}

function updateQueueUI() {
    $('topQueueCount').textContent = downloadQueue.length;
    const container = $('queueListContainer');
    const emptyPrompt = $('emptyQueuePrompt');

    if (downloadQueue.length === 0) {
        if (emptyPrompt) emptyPrompt.classList.remove('hidden');
        container.innerHTML = '';
        container.appendChild(emptyPrompt);
        return;
    }

    if (emptyPrompt) emptyPrompt.classList.add('hidden');
    container.innerHTML = '';

    downloadQueue.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'queue-item-card';

        let statusClass = 'status-waiting';
        let statusText = 'Chờ tải';
        if (q.status === 'downloading') {
            statusClass = 'status-downloading';
            statusText = '⚡ Đang tải...';
        } else if (q.status === 'done') {
            statusClass = 'status-done';
            statusText = '✅ Hoàn tất';
        } else if (q.status === 'error') {
            statusClass = 'status-error';
            statusText = '❌ Lỗi';
        }

        card.innerHTML = `
            <div class="queue-item-left">
                <span style="font-family: var(--font-mono); font-weight:700; color: var(--color-primary);">#${idx + 1}</span>
                <div style="min-width:0;">
                    <div class="queue-item-title">${q.title}</div>
                    <div class="queue-item-meta">${q.formatLabel} · ${q.ext.toUpperCase()} · ${q.size}</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="queue-item-status-pill ${statusClass}">${statusText}</span>
                <button type="button" class="btn-subtle-icon remove-q-btn" data-id="${q.id}" title="Xóa khỏi hàng chờ">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `;

        card.querySelector('.remove-q-btn').addEventListener('click', () => {
            downloadQueue = downloadQueue.filter(item => item.id !== q.id);
            updateQueueUI();
        });

        container.appendChild(card);
    });
}

$('clearQueueBtn')?.addEventListener('click', () => {
    downloadQueue = [];
    updateQueueUI();
    showToast('Đã xóa sạch hàng chờ tải xuống.', 'info');
});

$('startQueueDownloadBtn')?.addEventListener('click', async () => {
    if (downloadQueue.length === 0) {
        showToast('Hàng chờ đang trống!', 'error');
        return;
    }
    if (isQueueProcessing) {
        showToast('Hàng chờ đang được xử lý...', 'info');
        return;
    }

    processNextQueueItem();
});

async function processNextQueueItem() {
    const nextItem = downloadQueue.find(q => q.status === 'waiting');
    if (!nextItem) {
        isQueueProcessing = false;
        showToast('🎉 Toàn bộ hàng chờ đã được tải xong!', 'success');
        return;
    }

    isQueueProcessing = true;
    nextItem.status = 'downloading';
    updateQueueUI();

    // Switch to Studio Tab to show progress
    document.querySelector('.tab-btn[data-target="tab-workstation"]')?.click();

    // Start download for this queue item
    currentUrl = nextItem.url;
    selectedFormatValue = nextItem.format;
    $('url').value = nextItem.url;
    setFinalFormat(nextItem.format, nextItem.formatLabel);

    startDirectDownload();

    // Monitor completion to trigger next
    const checkInterval = setInterval(() => {
        if (!activeEventSource) {
            clearInterval(checkInterval);
            nextItem.status = $('statusBadge').classList.contains('success') ? 'done' : 'error';
            updateQueueUI();
            setTimeout(processNextQueueItem, 1000);
        }
    }, 1500);
}

// ── Log Console Output Helper ─────────────────────────
function appendLog(text) {
    const logs = $('logsContainer');
    if (!logs) return;
    const el = document.createElement('div');
    el.className = 'log-line';
    if (text.startsWith('[ERROR]')) el.classList.add('log-error');
    else if (text.startsWith('[download]')) el.classList.add('log-download');
    el.textContent = text;
    logs.appendChild(el);
    logs.scrollTop = logs.scrollHeight;
}

// ── Toast Notification Helper (Glassmorphic Top-Z) ────
function showToast(message, type = 'info') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '🎉';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span style="font-size:1.2rem; line-height:1;">${icon}</span> <div style="flex:1; white-space:pre-line;">${message}</div>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 5000);
}
