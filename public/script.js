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

// ── Language (i18n) Management ────────────────────────
const appLangSelect = document.getElementById('appLanguageSelect');
const settingsLangSelect = document.getElementById('settingsLanguageSelect');

function setAppLanguage(lang) {
    if (!lang) return;
    if (typeof applyLanguage === 'function') {
        applyLanguage(lang);
    }
    if (appLangSelect && appLangSelect.value !== lang) appLangSelect.value = lang;
    if (settingsLangSelect && settingsLangSelect.value !== lang) settingsLangSelect.value = lang;

    // If a video is already loaded, re-translate title to the newly selected language
    if (currentVideoData?.title) {
        translateVideoTitle(currentVideoData.title);
    }
}

// Initial sync and apply on page load
const initialLang = localStorage.getItem('appLanguage') || 'vi';
if (appLangSelect) appLangSelect.value = initialLang;
if (settingsLangSelect) settingsLangSelect.value = initialLang;
if (typeof applyLanguage === 'function') {
    applyLanguage(initialLang);
}

appLangSelect?.addEventListener('change', (e) => setAppLanguage(e.target.value));
settingsLangSelect?.addEventListener('change', (e) => setAppLanguage(e.target.value));

// ── Dynamic & Persistent Configuration Synchronization ──────────
const cachedSavedFolder = localStorage.getItem('userDownloadFolder');
if (cachedSavedFolder) {
    if (document.getElementById('quickDownloadFolder')) document.getElementById('quickDownloadFolder').value = cachedSavedFolder;
    if (document.getElementById('downloadFolder')) document.getElementById('downloadFolder').value = cachedSavedFolder;
}

// Fetch dynamic server configuration on load (from server's config.json)
fetch('/api/config')
  .then(r => r.json())
  .then(cfg => {
    if (cfg.downloadFolder) {
      localStorage.setItem('userDownloadFolder', cfg.downloadFolder);
      if (document.getElementById('quickDownloadFolder')) document.getElementById('quickDownloadFolder').value = cfg.downloadFolder;
      if (document.getElementById('downloadFolder')) document.getElementById('downloadFolder').value = cfg.downloadFolder;
    }
    if (cfg.bilibiliAvoidP2p !== undefined && document.getElementById('bilibiliAvoidP2p')) {
      document.getElementById('bilibiliAvoidP2p').checked = cfg.bilibiliAvoidP2p !== false;
    }
    if (cfg.bilibiliUposHost && document.getElementById('bilibiliUposHost')) {
      document.getElementById('bilibiliUposHost').value = cfg.bilibiliUposHost;
    }
  })
  .catch(() => {});

// Bilibili CDN Anti-P2P Settings event bindings
document.getElementById('bilibiliAvoidP2p')?.addEventListener('change', (e) => {
    const statusEl = document.getElementById('bilibiliAvoidP2pStatus');
    if (statusEl) {
        if (e.target.checked) {
            statusEl.textContent = typeof t === 'function' ? t('biliAvoidP2pActive') : '🛡️ Đang Bật (Tự động bypass CDN nghẽn)';
            statusEl.style.color = 'var(--color-success, #10b981)';
        } else {
            statusEl.textContent = typeof t === 'function' ? t('biliAvoidP2pInactive') : '⚠️ Đang Tắt (Có thể dính node P2P chậm)';
            statusEl.style.color = 'var(--color-warning, #f59e0b)';
        }
    }
    localStorage.setItem('bilibiliAvoidP2p', e.target.checked ? 'true' : 'false');
    fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bilibiliAvoidP2p: e.target.checked })
    }).catch(() => {});
});

document.getElementById('bilibiliUposHost')?.addEventListener('change', (e) => {
    localStorage.setItem('bilibiliUposHost', e.target.value);
    fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bilibiliUposHost: e.target.value })
    }).catch(() => {});
});

// Sync and save user-selected download directory across sessions
function syncAndPersistDownloadFolder(folderPath) {
    if (!folderPath) return;
    const cleanPath = folderPath.trim();
    if (!cleanPath) return;

    // 1. Immediately cache in localStorage for instant reload
    localStorage.setItem('userDownloadFolder', cleanPath);

    // 2. Update all folder inputs on the page
    const qf = document.getElementById('quickDownloadFolder');
    const df = document.getElementById('downloadFolder');
    if (qf && qf.value !== cleanPath) qf.value = cleanPath;
    if (df && df.value !== cleanPath) df.value = cleanPath;

    // 3. Save permanently to server's config.json
    fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadFolder: cleanPath })
    }).catch(err => console.warn('[Config] Failed to persist download folder:', err));
}

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
let parsedSubtitles = [];
let currentTypeFilter = 'all';
let currentSearchQuery = '';
let currentSubFilterQuery = '';
let currentPreviewSub = null;
let selectedFormatValue = 'bv*+ba/b';
let selectedRawFormat = null;
let currentViewMode = 'table';

// Language Code Dictionary & Friendly Name Mappings
const LANG_NAMES = {
    'vi': { name: 'Tiếng Việt', flag: '🇻🇳' },
    'vi-VN': { name: 'Tiếng Việt (VN)', flag: '🇻🇳' },
    'en': { name: 'English (Tiếng Anh)', flag: '🇺🇸' },
    'en-US': { name: 'English (US)', flag: '🇺🇸' },
    'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
    'zh': { name: 'Tiếng Trung (Chinese)', flag: '🇨🇳' },
    'zh-Hans': { name: 'Tiếng Trung (Giản thể)', flag: '🇨🇳' },
    'zh-Hant': { name: 'Tiếng Trung (Phồn thể)', flag: '🇹🇼' },
    'zh-CN': { name: 'Tiếng Trung (CN)', flag: '🇨🇳' },
    'zh-TW': { name: 'Tiếng Trung (TW)', flag: '🇹🇼' },
    'ja': { name: 'Tiếng Nhật (Japanese)', flag: '🇯🇵' },
    'ko': { name: 'Tiếng Hàn (Korean)', flag: '🇰🇷' },
    'fr': { name: 'Tiếng Pháp (French)', flag: '🇫🇷' },
    'de': { name: 'Tiếng Đức (German)', flag: '🇩🇪' },
    'es': { name: 'Tiếng Tây Ban Nha (Spanish)', flag: '🇪🇸' },
    'ru': { name: 'Tiếng Nga (Russian)', flag: '🇷🇺' },
    'th': { name: 'Tiếng Thái (Thai)', flag: '🇹🇭' },
    'id': { name: 'Tiếng Indonesia', flag: '🇮🇩' },
    'pt': { name: 'Tiếng Bồ Đào Nha', flag: '🇧🇷' },
    'it': { name: 'Tiếng Ý (Italian)', flag: '🇮🇹' },
    'ar': { name: 'Tiếng Ả Rập (Arabic)', flag: '🇸🇦' },
    'hi': { name: 'Tiếng Hindi (India)', flag: '🇮🇳' }
};

function getLanguageMeta(code, rawName) {
    if (LANG_NAMES[code]) return LANG_NAMES[code];
    const baseCode = code.split('-')[0];
    if (LANG_NAMES[baseCode]) return { name: rawName || LANG_NAMES[baseCode].name, flag: LANG_NAMES[baseCode].flag };
    return { name: rawName || code, flag: '🌐' };
}

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
            syncAndPersistDownloadFolder(data.path);
            showToast(`✅ Đã lưu thư mục mặc định mới:\n${data.path}`, 'success');
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

// Auto-save whenever user manually edits or pastes a folder path
$('quickDownloadFolder')?.addEventListener('change', (e) => {
    syncAndPersistDownloadFolder(e.target.value);
});
$('downloadFolder')?.addEventListener('change', (e) => {
    syncAndPersistDownloadFolder(e.target.value);
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

        // Bilibili Anti-P2P CDN & UPOS Server selection
        const biliAvoidP2p = $('bilibiliAvoidP2p')?.checked ?? true;
        const biliUposHost = val('bilibiliUposHost') || 'auto';
        qp.append('bilibili_avoid_p2p', biliAvoidP2p ? 'true' : 'false');
        if (biliUposHost !== 'auto' && biliUposHost !== 'default') {
            qp.append('bilibili_upos_host', biliUposHost);
        }

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
        processAndRenderSubtitles(data);
        translateVideoTitle(data.title);

        // Enable download buttons once options/formats are successfully loaded
        updateDownloadButtonState();

        const subMsg = parsedSubtitles.length > 0 ? ` và ${parsedSubtitles.length} phụ đề` : '';
        showToast(`🎉 Phân tích thành công! Đã tìm thấy ${data.formats?.length || 0} formats${subMsg}.`, 'success');
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

// ── Custom File Name State & Helpers ───────────────────────────
let currentOriginalTitle = '';
let currentTranslatedTitle = '';

function cleanFileNameString(str) {
    if (!str) return '';
    return str
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function updateCustomFileNameExt() {
    const extBadge = $('customFileNameExt');
    if (!extBadge) return;
    
    // Check if audio format is selected
    const audioFmt = val('audioFormat');
    if (audioFmt && audioFmt !== 'none') {
        extBadge.textContent = '.' + audioFmt;
        return;
    }

    const mergeFmt = val('quickMergeFormat') || val('mergeOutputFormat') || 'mkv';
    extBadge.textContent = mergeFmt ? '.' + mergeFmt : '.mkv';
}

// ── Render Video Hero Card ───────────────────────────
function renderVideoHero(data) {
    const card = $('videoHeroCard');
    const thumb = $('videoThumb');
    const durBadge = $('videoDurationBadge');
    const title = $('videoTitle');
    const uploader = $('videoUploader').querySelector('.text');
    const views = $('videoViews').querySelector('.text');
    const fmtCount = $('videoFormatCount').querySelector('.text');
    const subCountEl = $('videoSubCount');

    currentThumbnailUrl = data.thumbnail || '';
    currentOriginalTitle = data.title || '';
    currentTranslatedTitle = '';

    // Set custom file name input default value to current video title
    if ($('customFileNameInput')) {
        $('customFileNameInput').value = data.title || '';
    }
    updateCustomFileNameExt();

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

    if (subCountEl) {
        const totalSubs = parsedSubtitles.length;
        const hasVi = parsedSubtitles.some(s => s.langCode.startsWith('vi'));
        subCountEl.querySelector('.text').textContent = totalSubs > 0 ? (hasVi ? `💬 ${totalSubs} Subs (Có Tiếng Việt ⭐)` : `💬 ${totalSubs} Phụ đề`) : '0 Phụ đề';
        subCountEl.classList.toggle('has-vi', hasVi);
    }

    card.classList.remove('hidden');
}

// Click Subtitle pill in Hero Card to switch to subtitles view
$('videoSubCount')?.addEventListener('click', () => {
    const subPill = document.querySelector('.filter-pill[data-filter="subtitles"]');
    if (subPill) subPill.click();
});

// Custom Filename Action Buttons
$('useOriginalNameBtn')?.addEventListener('click', () => {
    if (currentOriginalTitle) {
        if ($('customFileNameInput')) $('customFileNameInput').value = currentOriginalTitle;
        showToast('Đã áp dụng tiêu đề gốc của video!', 'info');
    }
});

$('useTranslatedNameBtn')?.addEventListener('click', () => {
    if (currentTranslatedTitle || currentOriginalTitle) {
        if ($('customFileNameInput')) $('customFileNameInput').value = currentTranslatedTitle || currentOriginalTitle;
        showToast('Đã áp dụng tiêu đề đã dịch!', 'info');
    }
});

$('cleanFileNameBtn')?.addEventListener('click', () => {
    const currentVal = $('customFileNameInput')?.value || '';
    const cleaned = cleanFileNameString(currentVal);
    if ($('customFileNameInput')) $('customFileNameInput').value = cleaned;
    showToast('Đã làm sạch ký tự đặc biệt và emoji!', 'success');
});

$('quickMergeFormat')?.addEventListener('change', updateCustomFileNameExt);
$('mergeOutputFormat')?.addEventListener('change', updateCustomFileNameExt);
$('audioFormat')?.addEventListener('change', updateCustomFileNameExt);

// ── Multilingual Video Title Translation (Google Translate) ───
async function translateVideoTitle(rawTitle) {
    const transText = $('videoTranslatedTitle');
    if (!rawTitle || !transText) return;

    const lang = (typeof currentAppLanguage !== 'undefined' ? currentAppLanguage : localStorage.getItem('app_language')) || 'vi';
    const langNames = {
        vi: 'Tiếng Việt',
        en: 'English',
        zh: '简体中文',
        ja: '日本語'
    };
    const targetLabel = langNames[lang] || lang;
    
    const transLabelEl = document.querySelector('#videoTranslatedBox .trans-label span');
    if (transLabelEl) {
        transLabelEl.textContent = `${targetLabel} (Google Translate):`;
    }

    transText.textContent = typeof t === 'function' ? t('translatingText') : 'Đang dịch tiêu đề...';

    // If English and already standard ascii English, keep directly
    if (lang === 'en' && /^[\x00-\x7F]*$/.test(rawTitle)) {
        transText.textContent = rawTitle;
        currentTranslatedTitle = rawTitle;
        return;
    }

    try {
        const res = await fetch(`/api/translate?text=${encodeURIComponent(rawTitle)}&to=${encodeURIComponent(lang)}`);
        const data = await res.json();
        if (data.translated) {
            transText.textContent = data.translated;
            currentTranslatedTitle = data.translated;
        } else {
            transText.textContent = rawTitle;
            currentTranslatedTitle = rawTitle;
        }
    } catch (err) {
        transText.textContent = rawTitle;
        currentTranslatedTitle = rawTitle;
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
    const targetTitle = val('customFileNameInput') || currentVideoData?.title || 'video';
    showToast('⏳ Đang tải ảnh thumbnail HD của video...', 'info');

    try {
        const qp = new URLSearchParams({
            url: currentUrl,
            thumbUrl: currentThumbnailUrl || '',
            title: targetTitle,
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

    const subContainer = $('subtitlesModeContainer');
    const tableContainer = $('tableModeContainer');
    const cardsContainer = $('presetCardsContainer');
    const multiBar = $('multiSelectBar');
    const audioMergeBox = $('audioMergeHelperBox');

    if (currentTypeFilter === 'subtitles') {
        if (tableContainer) tableContainer.classList.add('hidden');
        if (cardsContainer) cardsContainer.classList.add('hidden');
        if (multiBar) multiBar.classList.add('hidden');
        if (audioMergeBox) audioMergeBox.classList.add('hidden');
        if (subContainer) subContainer.classList.remove('hidden');
        renderSubtitlesTable();
    } else {
        if (subContainer) subContainer.classList.add('hidden');
        if (multiBar) multiBar.classList.remove('hidden');
        if (currentViewMode === 'cards') {
            if (cardsContainer) cardsContainer.classList.remove('hidden');
            if (tableContainer) tableContainer.classList.add('hidden');
        } else {
            if (tableContainer) tableContainer.classList.remove('hidden');
            if (cardsContainer) cardsContainer.classList.add('hidden');
        }
        renderFormatTable();
    }
});

$('formatSearchInput').addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim();
    renderFormatTable();
});

$('subSearchInput')?.addEventListener('input', (e) => {
    currentSubFilterQuery = e.target.value.trim().toLowerCase();
    renderSubtitlesTable();
});

// ── View Mode Switcher (Table vs Cards) ───────────────
document.querySelectorAll('.mode-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentTypeFilter === 'subtitles') {
            // If in subtitles mode, switch back to 'all' filter first
            const allPill = document.querySelector('.filter-pill[data-filter="all"]');
            if (allPill) allPill.click();
        }

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

// ============================================================
// ── SUBTITLES EXPLORER & MANAGEMENT LOGIC ───────────────────
// ============================================================

function processAndRenderSubtitles(data) {
    parsedSubtitles = [];
    const manualSubs = data.subtitles || {};
    const autoSubs = data.automatic_captions || {};

    // 1. Extract Manual Uploaded Subtitles (Authored)
    Object.keys(manualSubs).forEach(lang => {
        const formats = manualSubs[lang] || [];
        const rawName = formats[0]?.name || '';
        const meta = getLanguageMeta(lang, rawName);
        const directFormats = formats.filter(f => !f.url?.includes('manifest') && !f.url?.includes('m3u8'));
        const pool = directFormats.length > 0 ? directFormats : formats;
        const srtFmt = pool.find(f => f.ext === 'srt') || pool.find(f => f.ext === 'vtt') || pool[0];
        const vttFmt = pool.find(f => f.ext === 'vtt') || pool.find(f => f.ext === 'srt') || pool[0];

        parsedSubtitles.push({
            langCode: lang,
            langName: meta.name,
            flag: meta.flag,
            isAuto: false,
            formats: formats,
            srtUrl: srtFmt?.url || '',
            vttUrl: vttFmt?.url || formats[0]?.url || '',
            availableExts: Array.from(new Set(formats.map(f => f.ext?.toUpperCase() || 'SRT'))).slice(0, 4)
        });
    });

    // 2. Extract Auto-generated Subtitles (Speech Recognition)
    Object.keys(autoSubs).forEach(lang => {
        if (!manualSubs[lang]) {
            const formats = autoSubs[lang] || [];
            const rawName = formats[0]?.name || '';
            const meta = getLanguageMeta(lang, rawName);
            const directFormats = formats.filter(f => !f.url?.includes('manifest') && !f.url?.includes('m3u8'));
            const pool = directFormats.length > 0 ? directFormats : formats;
            const srtFmt = pool.find(f => f.ext === 'srt') || pool.find(f => f.ext === 'vtt') || pool[0];
            const vttFmt = pool.find(f => f.ext === 'vtt') || pool.find(f => f.ext === 'srt') || pool[0];

            parsedSubtitles.push({
                langCode: lang,
                langName: meta.name,
                flag: meta.flag,
                isAuto: true,
                formats: formats,
                srtUrl: srtFmt?.url || '',
                vttUrl: vttFmt?.url || formats[0]?.url || '',
                availableExts: Array.from(new Set(formats.map(f => f.ext?.toUpperCase() || 'SRT'))).slice(0, 4)
            });
        }
    });

    // 3. Priority Sorting: Vietnamese -> English -> Manual before Auto -> Alphabetical
    parsedSubtitles.sort((a, b) => {
        const aIsVi = a.langCode.startsWith('vi');
        const bIsVi = b.langCode.startsWith('vi');
        if (aIsVi && !bIsVi) return -1;
        if (!aIsVi && bIsVi) return 1;

        const aIsEn = a.langCode.startsWith('en');
        const bIsEn = b.langCode.startsWith('en');
        if (aIsEn && !bIsEn) return -1;
        if (!aIsEn && bIsEn) return 1;

        if (a.isAuto !== b.isAuto) return a.isAuto ? 1 : -1;
        return a.langName.localeCompare(b.langName);
    });

    // Update Counts & Badges in Topbar, Hero Card, Subnav
    if ($('countSub')) $('countSub').textContent = parsedSubtitles.length;
    if ($('quickSubCountBadge')) $('quickSubCountBadge').textContent = `${parsedSubtitles.length} Subs`;
    if ($('subHeaderBadge')) {
        const manualCount = parsedSubtitles.filter(s => !s.isAuto).length;
        const autoCount = parsedSubtitles.filter(s => s.isAuto).length;
        $('subHeaderBadge').textContent = `${manualCount} thủ công · ${autoCount} tự động`;
    }

    const subCountEl = $('videoSubCount');
    if (subCountEl) {
        const totalSubs = parsedSubtitles.length;
        const hasVi = parsedSubtitles.some(s => s.langCode.startsWith('vi'));
        subCountEl.querySelector('.text').textContent = totalSubs > 0 ? (hasVi ? `💬 ${totalSubs} Subs (Có Tiếng Việt ⭐)` : `💬 ${totalSubs} Phụ đề`) : '0 Phụ đề';
        subCountEl.classList.toggle('has-vi', hasVi);
    }

    // Toggle Left Sidebar Quick Sub Card
    const quickSubCard = $('quickSubtitleCard');
    if (quickSubCard) {
        if (parsedSubtitles.length > 0) {
            quickSubCard.classList.remove('hidden');
            populateQuickSubDropdown();
        } else {
            quickSubCard.classList.add('hidden');
        }
    }

    renderSubtitlesTable();
}

// ── Populate Sidebar Quick Sub Dropdown ───────────────
function populateQuickSubDropdown() {
    const select = $('quickSubLangSelect');
    if (!select) return;
    select.innerHTML = '';

    parsedSubtitles.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.langCode;
        const typeTag = sub.isAuto ? '[Auto]' : '[Tác giả]';
        opt.textContent = `${sub.flag} ${sub.langName} (${sub.langCode}) ${typeTag}`;
        select.appendChild(opt);
    });
}

// ── Render Subtitles Table ────────────────────────────
function renderSubtitlesTable() {
    const tbody = $('subtitlesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filtered = parsedSubtitles.filter(sub => {
        if (!currentSubFilterQuery) return true;
        const q = currentSubFilterQuery;
        return sub.langName.toLowerCase().includes(q) ||
               sub.langCode.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 36px; color: var(--fg-muted);">
                    ${parsedSubtitles.length === 0 ? 'Video này không có phụ đề hoặc nền tảng không hỗ trợ trích xuất.' : 'Không tìm thấy phụ đề nào khớp với từ khóa.'}
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(sub => {
        const tr = document.createElement('tr');
        tr.className = 'sub-row';

        const typeBadge = sub.isAuto
            ? '<span class="sub-type-badge auto">🤖 Tự động (Auto)</span>'
            : '<span class="sub-type-badge manual">✨ Tác giả (Manual)</span>';

        const extsBadges = (sub.availableExts.length ? sub.availableExts : ['SRT', 'VTT'])
            .map(e => `<span class="badge-tag" style="font-size:0.72rem; padding: 2px 6px;">${e}</span>`)
            .join(' ');

        tr.innerHTML = `
            <td>
                <div class="sub-lang-title">
                    <span class="sub-lang-flag">${sub.flag}</span>
                    <span>${sub.langName}</span>
                </div>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                    <span class="sub-lang-code">${sub.langCode}</span>
                    ${typeBadge}
                </div>
            </td>
            <td>
                <div style="display:flex; gap:4px; flex-wrap:wrap;">
                    ${extsBadges}
                </div>
            </td>
            <td>
                <div class="sub-table-actions">
                    <button type="button" class="btn-sub-table-dl srt" title="Tải file phụ đề SubRip (.SRT)">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Tải .SRT</span>
                    </button>
                    <button type="button" class="btn-sub-table-dl vtt" title="Tải file phụ đề WebVTT (.VTT)">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Tải .VTT</span>
                    </button>
                    <button type="button" class="btn-sub-table-preview" title="Xem trước nội dung phụ đề">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>Xem Trước</span>
                    </button>
                </div>
            </td>
        `;

        tr.querySelector('.btn-sub-table-dl.srt').addEventListener('click', () => downloadSubtitleDirect(sub, 'srt'));
        tr.querySelector('.btn-sub-table-dl.vtt').addEventListener('click', () => downloadSubtitleDirect(sub, 'vtt'));
        tr.querySelector('.btn-sub-table-preview').addEventListener('click', () => previewSubtitle(sub));

        tbody.appendChild(tr);
    });
}

// ── Direct Subtitle Downloader ────────────────────────
async function downloadSubtitleDirect(subItem, format = 'srt') {
    if (!subItem) return;
    const targetFolder = val('quickDownloadFolder') || val('downloadFolder') || 'D:\\yt-dlp\\Download';
    const videoTitle = val('customFileNameInput') || currentVideoData?.title || 'video';

    showToast(`⏳ Đang tải phụ đề [${subItem.langName}] dạng .${format.toUpperCase()}...`, 'info');

    try {
        const subUrl = (format === 'srt' ? subItem.srtUrl : subItem.vttUrl) || subItem.vttUrl || subItem.srtUrl;
        const qp = new URLSearchParams({
            url: currentUrl,
            subUrl: subUrl,
            lang: subItem.langCode,
            format: format,
            title: videoTitle,
            browser: currentBrowser,
            output: targetFolder
        });

        const res = await fetch(`/api/download-subtitle?${qp}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi tải phụ đề');

        showToast(`🎉 ${data.message || 'Đã tải xong phụ đề!'}`, 'success');
    } catch (err) {
        showToast(`❌ Lỗi tải phụ đề: ${err.message}`, 'error');
    }
}

// ── Preview Subtitle Modal Handler ───────────────────
async function previewSubtitle(subItem) {
    if (!subItem) return;
    currentPreviewSub = subItem;

    const modal = $('subPreviewModal');
    const modalTitle = $('subModalTitle');
    const loading = $('subModalLoading');
    const content = $('subModalContent');
    const meta = $('subModalMeta');

    if (!modal) return;
    modalTitle.textContent = `Xem Trước: ${subItem.flag} ${subItem.langName} (${subItem.langCode})`;
    content.innerHTML = '';
    loading.classList.remove('hidden');
    modal.classList.remove('hidden');

    try {
        const subUrl = subItem.vttUrl || subItem.srtUrl;
        if (!subUrl) throw new Error('Không có đường dẫn stream trực tiếp cho phụ đề này');

        const res = await fetch(`/api/preview-subtitle?subUrl=${encodeURIComponent(subUrl)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi tải bản xem trước');

        const cues = data.cues || [];
        if (cues.length === 0) {
            content.innerHTML = '<p style="text-align:center; color:var(--fg-muted); padding:20px;">Không có nội dung thoại.</p>';
        } else {
            cues.forEach(c => {
                const cueDiv = document.createElement('div');
                cueDiv.className = 'sub-cue-item';
                cueDiv.innerHTML = `
                    <div class="sub-cue-time">⏱️ ${c.time}</div>
                    <div class="sub-cue-text">${c.text}</div>
                `;
                content.appendChild(cueDiv);
            });
            meta.textContent = `Hiển thị ${cues.length} câu thoại đầu tiên của video`;
        }
    } catch (err) {
        content.innerHTML = `<p style="text-align:center; color:var(--color-destructive); padding:20px;">❌ Không thể xem trước: ${err.message}</p>`;
    } finally {
        loading.classList.add('hidden');
    }
}

// Subtitle Modal Close & Actions
$('closeSubModalBtn')?.addEventListener('click', () => {
    $('subPreviewModal')?.classList.add('hidden');
});

$('subPreviewModal')?.addEventListener('click', (e) => {
    if (e.target === $('subPreviewModal')) {
        $('subPreviewModal').classList.add('hidden');
    }
});

$('modalDlSrtBtn')?.addEventListener('click', () => {
    if (currentPreviewSub) downloadSubtitleDirect(currentPreviewSub, 'srt');
});

$('modalDlVttBtn')?.addEventListener('click', () => {
    if (currentPreviewSub) downloadSubtitleDirect(currentPreviewSub, 'vtt');
});

// Sidebar Quick Subtitle Downloader Buttons
$('quickDlSrtBtn')?.addEventListener('click', () => {
    const selectedLang = val('quickSubLangSelect');
    const sub = parsedSubtitles.find(s => s.langCode === selectedLang) || parsedSubtitles[0];
    if (sub) downloadSubtitleDirect(sub, 'srt');
    else showToast('Vui lòng phân tích video có phụ đề trước.', 'info');
});

$('quickDlVttBtn')?.addEventListener('click', () => {
    const selectedLang = val('quickSubLangSelect');
    const sub = parsedSubtitles.find(s => s.langCode === selectedLang) || parsedSubtitles[0];
    if (sub) downloadSubtitleDirect(sub, 'vtt');
    else showToast('Vui lòng phân tích video có phụ đề trước.', 'info');
});

$('quickPreviewSubBtn')?.addEventListener('click', () => {
    const selectedLang = val('quickSubLangSelect');
    const sub = parsedSubtitles.find(s => s.langCode === selectedLang) || parsedSubtitles[0];
    if (sub) previewSubtitle(sub);
    else showToast('Vui lòng phân tích video có phụ đề trước.', 'info');
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
        concurrent_fragments: val('quickConcurrentFragments') || val('concurrentFragments') || '1',
        http_chunk_size:      (val('quickHttpChunkSize') || val('httpChunkSize')) !== 'none' ? (val('quickHttpChunkSize') || val('httpChunkSize') || '') : '',
        audio_format:         val('audioFormat'),
        audio_quality:        val('audioQuality'),
        recode_video:         val('recodeVideo'),
        merge_output_format:  val('quickMergeFormat') || val('mergeOutputFormat') || 'mkv',
        custom_filename:      val('customFileNameInput')?.trim() || '',
        bilibili_avoid_p2p:   $('bilibiliAvoidP2p')?.checked ? 'true' : 'false',
        bilibili_upos_host:    val('bilibiliUposHost') || 'auto',
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
    badge.textContent = 'Downloading';
    badge.className = 'status-badge processing';
    statusText.textContent = 'Đang kết nối và tải video...';
    
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
            } else if (line.includes('[Merger]') || line.includes('[ffmpeg]') || line.includes('[Fixup]') || line.includes('[VideoRemuxer]')) {
                statusText.textContent = '⚙️ Đang ghép Video & Audio (FFmpeg Muxing)...';
                $('metricSpeed').textContent = '⚡ Đang ghi ổ đĩa';
                $('metricEta').textContent = '⏱️ Đang hoàn tất';
                badge.textContent = 'Merging';
                bar.style.width = '98%';
                percentCounter.textContent = '98.0%';
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

    const customTitle = val('customFileNameInput') || currentVideoData?.title || 'Video';
    let addedCount = 0;
    selectedFormatSet.forEach(fmtId => {
        const item = parsedFormats.find(f => f.id === fmtId);
        if (item) {
            addSingleItemToQueue({
                url: currentUrl,
                title: customTitle,
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
    if ($('customFileNameInput')) $('customFileNameInput').value = nextItem.title;
    setFinalFormat(nextItem.format, nextItem.formatLabel);

    startDirectDownload({ custom_filename: nextItem.title });

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
