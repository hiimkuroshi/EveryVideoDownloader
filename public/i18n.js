/* ═════════════════════════════════════════════════════════════════════════
   EveryVideoDownloader — Internationalization (i18n) System
   Supported Languages: Tiếng Việt (vi), English (en), 简体中文 (zh), 日本語 (ja)
   ═════════════════════════════════════════════════════════════════════════ */

const I18N = {
  vi: {
    // ── Brand & Meta ──
    appTitle: "EveryVideoDownloader — Media Downloader Workstation (Powered by yt-dlp)",
    brandSub: "POWERED BY YT-DLP",

    // ── Topbar Search & Cookies ──
    urlPlaceholder: "Dán link Video (YouTube, TikTok, Bilibili, Facebook, Douyin, X...)",
    cookieTitle: "Cookies trình duyệt (tùy chọn)",
    cookieDefault: "Mặc định",
    analyzeBtn: "Phân Tích (-F)",
    analyzingBtn: "Đang phân tích...",
    themeToggleTitle: "Chuyển chế độ Sáng / Tối",

    // ── Navigation Tabs ──
    tabStudio: "Studio",
    tabQueue: "Hàng Chờ",
    tabAdvanced: "Nâng Cao",
    tabSettings: "Cài Đặt",

    // ── Sidebar: Empty Hero Guide ──
    emptyHeroTitle: "Sẵn sàng tải video",
    emptyHeroDesc: "Dán liên kết video vào thanh trên cùng và nhấn <strong>Phân Tích (-F)</strong> để trích xuất toàn bộ tùy chọn độ phân giải và định dạng.",
    otherSites: "1000+ trang khác",

    // ── Sidebar: Hero Metadata ──
    dlThumbBtn: "Tải Thumbnail",
    dlThumbBtnLoading: "Đang lưu...",
    channelLabel: "Kênh nguồn",
    viewsLabel: "views",
    formatsCount: "Formats",
    subsCount: "Phụ đề",
    originalTitleLabel: "Tiêu đề video gốc",
    transTitleLabel: "Tiếng Việt (Google Dịch):",
    translatingText: "Đang dịch tiêu đề sang tiếng Việt...",
    customFileNameLabel: "Tên file khi tải về:",
    customFileNamePlaceholder: "Nhập tên file bạn muốn lưu...",
    useOriginalName: "Gốc",
    useTranslatedName: "Dịch",
    cleanFileName: "Làm sạch",

    // ── Sidebar: Quick Subtitle ──
    quickSubTitle: "Trích Xuất & Tải Nhanh Phụ Đề",
    quickSubSelectLabel: "Chọn ngôn ngữ phụ đề:",
    quickSubNone: "(Chưa có phụ đề)",
    quickDlSrt: "Tải .SRT",
    quickDlVtt: "Tải .VTT",
    quickPreviewSub: "Xem Trước",

    // ── Sidebar: Speed & Destination ──
    speedCardTitle: "Tối Ưu Tốc Độ & Thư Mục Lưu",
    saveFolderLabel: "Thư mục lưu:",
    openFolderBtn: "Mở Folder",
    changeFolderBtn: "Đổi...",
    containerLabel: "Container:",
    containerAuto: "🔄 Auto",
    threadsLabel: "Đa luồng (-N):",
    threads1: "🛡️ 1 Luồng (Mặc định - Ổn định nhất)",
    threads4: "⚡ 4 Luồng (Tăng tốc an toàn)",
    threads8: "🚀 8 Luồng (Mạng mạnh)",
    threads16: "🔥 16 Luồng (Siêu tốc)",
    chunkSizeLabel: "Chunk size:",
    chunk10M: "⭐ 10 MB (Chia khối Range)",
    chunk5M: "🛡️ 5 MB (Mạng yếu / 4G)",
    chunk2M: "⚡ 2 MB",
    chunk1M: "🐢 1 MB",
    chunk20M: "🚀 20 MB (Mạng mạnh)",
    chunk50M: "🔥 50 MB",
    chunk100M: "⚡ 100 MB",
    chunkOff: "🔄 Tắt (Mặc định - Luồng mượt)",
    switchSubtitles: "Phụ đề",
    switchThumbnail: "Ảnh bìa",
    switchMetadata: "Metadata",
    switchPlaylist: "Playlist",

    // ── Main Explorer Toolbar ──
    filterAll: "Tất Cả",
    filterVideo: "🎬 Video Only",
    filterAudio: "🎵 Audio Only",
    filterCombo: "🎥 Combo",
    filterSubs: "💬 Phụ Đề",
    searchPlaceholder: "Tìm ID, Codec (av01, hvc1, avc), 1080p, mp4...",
    viewTableTitle: "Xem dạng Bảng chi tiết (hỗ trợ Sort & Multi-select)",
    viewCardsTitle: "Xem dạng Mẫu nhanh gọn",
    selectedCountPrefix: "Đã chọn: ",
    selectedCountSuffix: " định dạng",
    addSelectedToQueue: "Thêm Mục Đã Chọn Vào Hàng Chờ",

    // ── Formats Table Headers ──
    thSelectAll: "Chọn tất cả",
    thId: "ID",
    thResolution: "Độ Phân Giải",
    thExt: "Ext",
    thFps: "FPS",
    thVCodec: "Video Codec",
    thACodec: "Audio Codec",
    thBitrate: "Bitrate",
    thSize: "Dung Lượng",
    thNotes: "Thông Tin / Notes",
    emptyTablePrompt: "Chưa có dữ liệu formats. Vui lòng nhập link video phía trên và nhấn <strong>Phân Tích (-F)</strong>.",

    // ── Subtitles Table ──
    subsListTitle: "Danh Sách Phụ Đề Trích Xuất",
    subsSearchPlaceholder: "Lọc ngôn ngữ (vi, en, Nhật, Trung...)",
    subsThLang: "Ngôn Ngữ",
    subsThCode: "Mã & Loại",
    subsThFormat: "Định Dạng",
    subsThAction: "Tác Vụ Tải & Xem Trước",
    emptySubsPrompt: "Chưa có dữ liệu phụ đề. Vui lòng nhấn <strong>Phân Tích (-F)</strong>.",

    // ── Audio Merge Bar ──
    audioMergeEnable: "Tự động ghép âm thanh tốt nhất (Khuyên dùng)",
    audioMergeTrackLabel: "Track âm thanh:",
    audioMergeBest: "🌟 Best Audio (Tự động chọn âm thanh tốt nhất)",

    // ── CTA Download Card ──
    formatFlagLabel: "Format flag:",
    customFormatPlaceholder: "Nhập format...",
    editFormatManual: "Tự chỉnh sửa chuỗi format",
    startDownloadBtn: "Bắt Đầu Tải Xuống",
    downloadingBtn: "Đang Tải Xuống...",

    // ── Real-Time Loading & Progress Card ──
    statusPreparing: "Đang chuẩn bị...",
    statusDownloading: "Đang tải xuống",
    statusCompleted: "Hoàn tất",
    statusPaused: "Đã tạm dừng",
    statusCancelled: "Đã hủy",
    metricSpeedPrefix: "⚡ Tốc độ: ",
    metricEtaPrefix: "⏱️ Còn lại: ",
    metricSizePrefix: "📦 Dung lượng: ",
    successAlertTitle: "🎉 Tải Xuống Hoàn Tất Thành Công!",
    successAlertSub: "File đã lưu an toàn vào thư mục máy tính",
    openSavedFolderBtn: "📂 Mở Thư Mục Chứa File",
    pauseBtn: "Tạm Dừng",
    resumeBtn: "Tiếp Tục",
    cancelBtn: "Hủy Tải",
    toggleLogsBtn: "Log Terminal",

    // ── Subtitle Preview Modal ──
    subModalTitle: "Xem Trước Phụ Đề",
    subModalLoading: "Đang tải nội dung phụ đề...",
    subModalMeta: "Hiển thị các câu thoại mẫu",
    modalDlSrt: "Tải File .SRT",
    modalDlVtt: "Tải File .VTT",

    // ── Tab 2: Queue ──
    queueTitle: "📋 Danh Sách Hàng Chờ Tải Xuống",
    queueDesc: "Các tác vụ trong hàng chờ sẽ được tải tuần tự tự động.",
    startQueueBtn: "Bắt Đầu Tải Hàng Chờ",
    clearQueueBtn: "Xóa Hàng Chờ",
    emptyQueuePrompt: "Hàng chờ đang trống. Chọn các format từ bảng Studio và nhấn \"Thêm Vào Hàng Chờ\".",
    queueProcessing: "Đang xử lý hàng chờ...",
    queueDone: "Tất cả tác vụ trong hàng chờ đã hoàn tất!",

    // ── Tab 3: Advanced & Tuning ──
    advSpeedTitle: "⚡ Tăng Tốc Tải & Kết Nối Mạng (Speed & Network)",
    advRetriesLabel: "Số lần thử lại khi lỗi trích xuất (Retries)",
    advRateLimitLabel: "Giới hạn tốc độ tải (Rate Limit)",
    advRateLimitPlaceholder: "Ví dụ: 500K, 2M (để trống = không giới hạn)",
    advBiliCdnTitle: "🚀 Tối Ưu CDN Bilibili & Chống Nghẽn P2P (Bilibili Anti-P2P & UPOS Selector)",
    biliAvoidP2pLabel: "Tự động tránh CDN P2P / MCDN (Khuyên dùng)",
    biliAvoidP2pTip: "Tự động phát hiện và loại bỏ các node mạng P2P/MCDN (mcdn.bilivideo.cn, szbdyd.com) gây bóp nghẹt băng thông, chuyển sang CDN backbone chính thống.",
    biliAvoidP2pActive: "🛡️ Đang Bật (Tự động bypass CDN nghẽn)",
    biliAvoidP2pInactive: "⚠️ Đang Tắt (Có thể dính node P2P chậm)",
    biliUposHostLabel: "Máy chủ CDN Bilibili (UPOS Server)",
    biliUposHostTip: "Chọn máy chủ CDN UPOS để tải video Bilibili. Alibaba Overseas CDN (mirroraliov) hoặc Tencent Overseas (mirrorcosov) cho tốc độ cao và ổn định nhất tại Việt Nam & Quốc tế.",
    biliUposAuto: "⚡ Tự động (Ưu tiên CDN Quốc tế Alibaba / Tencent)",
    biliUposAliOv: "🌏 Alibaba Overseas CDN (upos-sz-mirroraliov) — Tốc độ cao nhất & Ổn định tại VN",
    biliUposCosOv: "🌐 Tencent Overseas CDN (upos-sz-mirrorcosov) — Tối ưu Quốc tế",
    biliUposAkam: "⚡ Akamai Global CDN (upos-hz-mirrorakam) — Băng thông toàn cầu",
    biliUposAli: "🚀 Alibaba Cloud Nội địa TQ (upos-sz-mirrorali)",
    biliUposCos: "🛡️ Tencent Cloud Nội địa TQ (upos-sz-mirrorcos)",
    biliUposHw: "🌐 Huawei Cloud Nội địa TQ (upos-sz-mirrorhw)",
    biliUposBos: "🏢 Baidu Cloud Nội địa TQ (upos-sz-mirrorbos)",
    biliUposRaw: "🔄 Giữ nguyên CDN gốc Bilibili (Cho phép P2P)",
    advPostTitle: "🎬 Định Dạng & Hậu Kỳ (Post-Processing)",
    advRecodeLabel: "Mã hóa lại video sang (Recode Video)",
    advAudioFormatLabel: "Trích xuất riêng âm thanh (Extract Audio)",
    advConvertThumbLabel: "Chuyển đổi định dạng ảnh bìa",
    advSecurityTitle: "🛡️ Hành Vi & Bảo Mật",
    advUsernameLabel: "Tên đăng nhập (Username / Email)",
    advPasswordLabel: "Mật khẩu (Password)",
    advGeoBypass: "Bỏ qua giới hạn địa lý (Geo Bypass)",
    advForceIpv4: "Bắt buộc kết nối IPv4",
    advRestrictFilenames: "Giới hạn tên file chỉ ký tự ASCII",
    advNoOverwrites: "Không ghi đè file đã tồn tại",

    // ── Tab 4: Settings ──
    settingsPathTitle: "📁 Đường Dẫn & Mẫu Tên File",
    settingsFolderLabel: "Thư mục lưu video tải về",
    settingsTemplateLabel: "Mẫu tên file (Output Template)",
    settingsProxyTitle: "🌐 Mạng & Proxy",
    settingsProxyLabel: "Địa chỉ Proxy",
    settingsUserAgentLabel: "Tùy chỉnh User-Agent",
    settingsLangTitle: "🌍 Ngôn Ngữ Giao Diện (Interface Language)",
    settingsLangLabel: "Chọn ngôn ngữ hiển thị:",

    // ── Toast Messages ──
    toastInputUrl: "Vui lòng nhập đường link video hợp lệ",
    toastAnalyzing: "Đang phân tích video...",
    toastDirectStream: "Đã phân giải luồng trực tiếp siêu tốc!",
    toastFetchError: "Lỗi khi lấy thông tin video",
    toastFolderChosen: "Đã lưu thư mục mặc định mới:\n",
    toastThumbDownloading: "⏳ Đang tải ảnh thumbnail HD của video...",
    toastThumbSuccess: "🎉 Đã tải ảnh thumbnail HD thành công!\nĐã lưu vào: ",
    toastThumbError: "⚠️ Không thể tải ảnh bìa",
    toastSubSuccess: "🎉 Đã tải phụ đề thành công: ",
    toastDlSuccess: "🎉 Tải file thành công!",
    toastDlCancelled: "Đã hủy tiến trình tải xuống",
    toastDlPaused: "Đã tạm dừng tiến trình tải",
    toastDlResumed: "Đang tiếp tục tải xuống...",
  },

  en: {
    // ── Brand & Meta ──
    appTitle: "EveryVideoDownloader — Media Downloader Workstation (Powered by yt-dlp)",
    brandSub: "POWERED BY YT-DLP",

    // ── Topbar Search & Cookies ──
    urlPlaceholder: "Paste video link (YouTube, TikTok, Bilibili, Facebook, Douyin, X...)",
    cookieTitle: "Browser cookies (optional)",
    cookieDefault: "Default",
    analyzeBtn: "Analyze (-F)",
    analyzingBtn: "Analyzing...",
    themeToggleTitle: "Toggle Light / Dark Mode",

    // ── Navigation Tabs ──
    tabStudio: "Studio",
    tabQueue: "Queue",
    tabAdvanced: "Advanced",
    tabSettings: "Settings",

    // ── Sidebar: Empty Hero Guide ──
    emptyHeroTitle: "Ready to Download Video",
    emptyHeroDesc: "Paste a video link into the top bar and click <strong>Analyze (-F)</strong> to extract all resolution and format options.",
    otherSites: "1000+ other sites",

    // ── Sidebar: Hero Metadata ──
    dlThumbBtn: "Download Thumbnail",
    dlThumbBtnLoading: "Saving...",
    channelLabel: "Channel / Creator",
    viewsLabel: "views",
    formatsCount: "Formats",
    subsCount: "Subtitles",
    originalTitleLabel: "Original Video Title",
    transTitleLabel: "English Translation:",
    translatingText: "Translating title...",
    customFileNameLabel: "Custom Download File Name:",
    customFileNamePlaceholder: "Enter custom file name to save as...",
    useOriginalName: "Original",
    useTranslatedName: "Translated",
    cleanFileName: "Clean",

    // ── Sidebar: Quick Subtitle ──
    quickSubTitle: "Extract & Quick Download Subtitles",
    quickSubSelectLabel: "Select subtitle language:",
    quickSubNone: "(No subtitles available)",
    quickDlSrt: "Download .SRT",
    quickDlVtt: "Download .VTT",
    quickPreviewSub: "Preview",

    // ── Sidebar: Speed & Destination ──
    speedCardTitle: "Speed Optimization & Save Folder",
    saveFolderLabel: "Save folder:",
    openFolderBtn: "Open Folder",
    changeFolderBtn: "Change...",
    containerLabel: "Container:",
    containerAuto: "🔄 Auto",
    threadsLabel: "Multi-threading (-N):",
    threads1: "🛡️ 1 Thread (Default - Most Stable)",
    threads4: "⚡ 4 Threads (Safe Acceleration)",
    threads8: "🚀 8 Threads (High Speed)",
    threads16: "🔥 16 Threads (Ultra Speed)",
    chunkSizeLabel: "Chunk size:",
    chunk10M: "⭐ 10 MB (Range Chunks)",
    chunk5M: "🛡️ 5 MB (Slow network / 4G)",
    chunk2M: "⚡ 2 MB",
    chunk1M: "🐢 1 MB",
    chunk20M: "🚀 20 MB (High speed)",
    chunk50M: "🔥 50 MB",
    chunk100M: "⚡ 100 MB",
    chunkOff: "🔄 Off (Default & Continuous Stream)",
    switchSubtitles: "Subtitles",
    switchThumbnail: "Thumbnail",
    switchMetadata: "Metadata",
    switchPlaylist: "Playlist",

    // ── Main Explorer Toolbar ──
    filterAll: "All",
    filterVideo: "🎬 Video Only",
    filterAudio: "🎵 Audio Only",
    filterCombo: "🎥 Combo",
    filterSubs: "💬 Subtitles",
    searchPlaceholder: "Search ID, Codec (av01, hvc1, avc), 1080p, mp4...",
    viewTableTitle: "Detailed Table View (Sort & Multi-select)",
    viewCardsTitle: "Quick Cards View",
    selectedCountPrefix: "Selected: ",
    selectedCountSuffix: " formats",
    addSelectedToQueue: "Add Selected To Queue",

    // ── Formats Table Headers ──
    thSelectAll: "Select All",
    thId: "ID",
    thResolution: "Resolution",
    thExt: "Ext",
    thFps: "FPS",
    thVCodec: "Video Codec",
    thACodec: "Audio Codec",
    thBitrate: "Bitrate",
    thSize: "File Size",
    thNotes: "Info / Notes",
    emptyTablePrompt: "No formats data yet. Please enter a video link above and click <strong>Analyze (-F)</strong>.",

    // ── Subtitles Table ──
    subsListTitle: "Extracted Subtitles List",
    subsSearchPlaceholder: "Filter language (en, vi, Japanese, Chinese...)",
    subsThLang: "Language",
    subsThCode: "Code & Type",
    subsThFormat: "Format",
    subsThAction: "Download & Preview Actions",
    emptySubsPrompt: "No subtitle data found. Please click <strong>Analyze (-F)</strong>.",

    // ── Audio Merge Bar ──
    audioMergeEnable: "Automatically merge best audio (Recommended)",
    audioMergeTrackLabel: "Audio Track:",
    audioMergeBest: "🌟 Best Audio (Auto-select highest quality audio)",

    // ── CTA Download Card ──
    formatFlagLabel: "Format flag:",
    customFormatPlaceholder: "Enter format string...",
    editFormatManual: "Edit format string manually",
    startDownloadBtn: "Start Download",
    downloadingBtn: "Downloading...",

    // ── Real-Time Loading & Progress Card ──
    statusPreparing: "Preparing...",
    statusDownloading: "Downloading",
    statusCompleted: "Completed",
    statusPaused: "Paused",
    statusCancelled: "Cancelled",
    metricSpeedPrefix: "⚡ Speed: ",
    metricEtaPrefix: "⏱️ ETA: ",
    metricSizePrefix: "📦 Size: ",
    successAlertTitle: "🎉 Download Completed Successfully!",
    successAlertSub: "File has been saved safely to your computer",
    openSavedFolderBtn: "📂 Open Containing Folder",
    pauseBtn: "Pause",
    resumeBtn: "Resume",
    cancelBtn: "Cancel",
    toggleLogsBtn: "Terminal Logs",

    // ── Subtitle Preview Modal ──
    subModalTitle: "Subtitle Preview",
    subModalLoading: "Loading subtitle content...",
    subModalMeta: "Showing sample dialogue lines",
    modalDlSrt: "Download .SRT",
    modalDlVtt: "Download .VTT",

    // ── Tab 2: Queue ──
    queueTitle: "📋 Download Queue Manager",
    queueDesc: "Tasks in queue will be downloaded sequentially and automatically.",
    startQueueBtn: "Start Queue Download",
    clearQueueBtn: "Clear Queue",
    emptyQueuePrompt: "Download queue is empty. Select formats in Studio table and click \"Add Selected To Queue\".",
    queueProcessing: "Processing queue...",
    queueDone: "All queued download tasks completed!",

    // ── Tab 3: Advanced & Tuning ──
    advSpeedTitle: "⚡ Speed Acceleration & Network",
    advRetriesLabel: "Extractor Retries",
    advRateLimitLabel: "Download Rate Limit",
    advRateLimitPlaceholder: "e.g. 500K, 2M (leave blank = unlimited)",
    advBiliCdnTitle: "🚀 Bilibili CDN & Anti-P2P Optimization (Anti-P2P & UPOS Selector)",
    biliAvoidP2pLabel: "Automatically bypass P2P / MCDN CDNs (Recommended)",
    biliAvoidP2pTip: "Automatically detect and avoid bandwidth-throttled P2P/MCDN nodes (mcdn.bilivideo.cn, szbdyd.com) and switch to official backbone CDNs.",
    biliAvoidP2pActive: "🛡️ Enabled (Auto bypass throttled CDNs)",
    biliAvoidP2pInactive: "⚠️ Disabled (May connect to slow P2P nodes)",
    biliUposHostLabel: "Bilibili CDN Server (UPOS Server)",
    biliUposHostTip: "Select the UPOS CDN server for downloading Bilibili videos. Alibaba Overseas CDN (mirroraliov) or Tencent Overseas (mirrorcosov) provides the highest speed and stability internationally.",
    biliUposAuto: "⚡ Automatic (Prioritize Overseas Alibaba / Tencent CDN)",
    biliUposAliOv: "🌏 Alibaba Overseas CDN (upos-sz-mirroraliov) — Fastest & Most Stable",
    biliUposCosOv: "🌐 Tencent Overseas CDN (upos-sz-mirrorcosov) — Global Optimized",
    biliUposAkam: "⚡ Akamai Global CDN (upos-hz-mirrorakam) — Worldwide Bandwidth",
    biliUposAli: "🚀 Alibaba Cloud China Domestic (upos-sz-mirrorali)",
    biliUposCos: "🛡️ Tencent Cloud China Domestic (upos-sz-mirrorcos)",
    biliUposHw: "🌐 Huawei Cloud China Domestic (upos-sz-mirrorhw)",
    biliUposBos: "🏢 Baidu Cloud China Domestic (upos-sz-mirrorbos)",
    biliUposRaw: "🔄 Keep Original Bilibili CDN (Allow P2P)",
    advPostTitle: "🎬 Format & Post-Processing",
    advRecodeLabel: "Recode Video To",
    advAudioFormatLabel: "Extract Audio Only To",
    advConvertThumbLabel: "Convert Thumbnail Format",
    advSecurityTitle: "🛡️ Behavior & Security",
    advUsernameLabel: "Username / Email",
    advPasswordLabel: "Password",
    advGeoBypass: "Bypass Geographic Restrictions (Geo Bypass)",
    advForceIpv4: "Force IPv4 Connection",
    advRestrictFilenames: "Restrict Filenames to ASCII Only",
    advNoOverwrites: "Do Not Overwrite Existing Files",

    // ── Tab 4: Settings ──
    settingsPathTitle: "📁 Storage Paths & Filename Templates",
    settingsFolderLabel: "Default Download Folder",
    settingsTemplateLabel: "Output Filename Template",
    settingsProxyTitle: "🌐 Network & Proxy",
    settingsProxyLabel: "Proxy Server Address",
    settingsUserAgentLabel: "Custom User-Agent",
    settingsLangTitle: "🌍 Interface Language",
    settingsLangLabel: "Select UI Display Language:",

    // ── Toast Messages ──
    toastInputUrl: "Please enter a valid video URL",
    toastAnalyzing: "Analyzing video streams...",
    toastDirectStream: "Direct stream resolved instantly!",
    toastFetchError: "Failed to extract video information",
    toastFolderChosen: "New default folder saved:\n",
    toastThumbDownloading: "⏳ Downloading HD thumbnail...",
    toastThumbSuccess: "🎉 HD Thumbnail downloaded successfully!\nSaved to: ",
    toastThumbError: "⚠️ Could not download thumbnail",
    toastSubSuccess: "🎉 Subtitle downloaded successfully: ",
    toastDlSuccess: "🎉 File downloaded successfully!",
    toastDlCancelled: "Download process cancelled",
    toastDlPaused: "Download paused",
    toastDlResumed: "Resuming download...",
  },

  zh: {
    // ── Brand & Meta ──
    appTitle: "EveryVideoDownloader — 全能音视频下载工作站 (基于 yt-dlp)",
    brandSub: "POWERED BY YT-DLP",

    // ── Topbar Search & Cookies ──
    urlPlaceholder: "粘贴视频链接 (YouTube, 抖音, 哔哩哔哩, TikTok, Facebook, X...)",
    cookieTitle: "浏览器 Cookies (可选)",
    cookieDefault: "默认",
    analyzeBtn: "解析格式 (-F)",
    analyzingBtn: "正在解析...",
    themeToggleTitle: "切换 明亮 / 暗黑 模式",

    // ── Navigation Tabs ──
    tabStudio: "工作台",
    tabQueue: "下载队列",
    tabAdvanced: "高级选项",
    tabSettings: "系统设置",

    // ── Sidebar: Empty Hero Guide ──
    emptyHeroTitle: "准备就绪，随时下载",
    emptyHeroDesc: "在顶部搜索栏中粘贴视频链接，并点击 <strong>解析格式 (-F)</strong> 提取所有清晰度和格式选项。",
    otherSites: "支持 1000+ 主流站点",

    // ── Sidebar: Hero Metadata ──
    dlThumbBtn: "下载封面",
    dlThumbBtnLoading: "保存中...",
    channelLabel: "发布作者 / 频道",
    viewsLabel: "次观看",
    formatsCount: "个格式",
    subsCount: "条字幕",
    originalTitleLabel: "原始视频标题",
    transTitleLabel: "中文翻译标题：",
    translatingText: "正在自动翻译标题...",
    customFileNameLabel: "下载文件名:",
    customFileNamePlaceholder: "输入要保存的文件名...",
    useOriginalName: "原始",
    useTranslatedName: "翻译",
    cleanFileName: "清理",

    // ── Sidebar: Quick Subtitle ──
    quickSubTitle: "快速提取与下载字幕",
    quickSubSelectLabel: "选择字幕语言：",
    quickSubNone: "(暂无可用字幕)",
    quickDlSrt: "下载 .SRT",
    quickDlVtt: "下载 .VTT",
    quickPreviewSub: "预览内容",

    // ── Sidebar: Speed & Destination ──
    speedCardTitle: "下载加速与存储目录",
    saveFolderLabel: "保存目录：",
    openFolderBtn: "打开目录",
    changeFolderBtn: "更改...",
    containerLabel: "封装格式：",
    containerAuto: "🔄 自动",
    threadsLabel: "多线程加速 (-N)：",
    threads1: "🛡️ 1 线程 (默认 - 最稳定)",
    threads4: "⚡ 4 线程 (安全加速)",
    threads8: "🚀 8 线程 (高速网络)",
    threads16: "🔥 16 线程 (极速)",
    chunkSizeLabel: "分块大小：",
    chunk10M: "⭐ 10 MB (分块下载)",
    chunk5M: "🛡️ 5 MB (网络较弱/4G)",
    chunk2M: "⚡ 2 MB",
    chunk1M: "🐢 1 MB",
    chunk20M: "🚀 20 MB (高速网络)",
    chunk50M: "🔥 50 MB",
    chunk100M: "⚡ 100 MB",
    chunkOff: "🔄 关闭 (默认 - 连续流更稳定)",
    switchSubtitles: "字幕",
    switchThumbnail: "封面",
    switchMetadata: "元数据",
    switchPlaylist: "播放列表",

    // ── Main Explorer Toolbar ──
    filterAll: "全部格式",
    filterVideo: "🎬 仅视频",
    filterAudio: "🎵 仅音频",
    filterCombo: "🎥 音画合一",
    filterSubs: "💬 字幕列表",
    searchPlaceholder: "搜索 ID, 编码 (av01, hvc1, avc), 1080p, mp4...",
    viewTableTitle: "详细表格视图 (支持多选与排序)",
    viewCardsTitle: "预设卡片视图",
    selectedCountPrefix: "已选择: ",
    selectedCountSuffix: " 个格式",
    addSelectedToQueue: "将选中项加入下载队列",

    // ── Formats Table Headers ──
    thSelectAll: "全选",
    thId: "ID",
    thResolution: "分辨率",
    thExt: "格式",
    thFps: "帧率",
    thVCodec: "视频编码",
    thACodec: "音频编码",
    thBitrate: "码率",
    thSize: "文件大小",
    thNotes: "详细信息 / 备注",
    emptyTablePrompt: "暂无格式数据。请在上方输入视频链接并点击 <strong>解析格式 (-F)</strong>。",

    // ── Subtitles Table ──
    subsListTitle: "已解析字幕列表",
    subsSearchPlaceholder: "筛选语言 (中文, 英语, 日语, 越南语...)",
    subsThLang: "语言名称",
    subsThCode: "语言代码 & 类型",
    subsThFormat: "字幕格式",
    subsThAction: "下载与预览操作",
    emptySubsPrompt: "暂无字幕数据。请点击 <strong>解析格式 (-F)</strong> 进行分析。",

    // ── Audio Merge Bar ──
    audioMergeEnable: "自动合并最佳音轨 (推荐开启)",
    audioMergeTrackLabel: "音频轨：",
    audioMergeBest: "🌟 Best Audio (自动选取最高音质)",

    // ── CTA Download Card ──
    formatFlagLabel: "格式指令：",
    customFormatPlaceholder: "输入自定义格式...",
    editFormatManual: "手动修改格式代码",
    startDownloadBtn: "立即开始下载",
    downloadingBtn: "正在下载中...",

    // ── Real-Time Loading & Progress Card ──
    statusPreparing: "正在准备...",
    statusDownloading: "正在下载",
    statusCompleted: "下载完成",
    statusPaused: "已暂停",
    statusCancelled: "已取消",
    metricSpeedPrefix: "⚡ 速度: ",
    metricEtaPrefix: "⏱️ 剩余时间: ",
    metricSizePrefix: "📦 文件大小: ",
    successAlertTitle: "🎉 视频下载成功完成！",
    successAlertSub: "文件已安全保存至本地电脑存储目录",
    openSavedFolderBtn: "📂 打开文件所在文件夹",
    pauseBtn: "暂停下载",
    resumeBtn: "继续下载",
    cancelBtn: "取消下载",
    toggleLogsBtn: "终端日志",

    // ── Subtitle Preview Modal ──
    subModalTitle: "字幕内容预览",
    subModalLoading: "正在加载字幕内容...",
    subModalMeta: "展示前几十句台词样例",
    modalDlSrt: "下载 .SRT 文件",
    modalDlVtt: "下载 .VTT 文件",

    // ── Tab 2: Queue ──
    queueTitle: "📋 批量下载队列管理",
    queueDesc: "队列中的任务将按照顺序全自动后台下载。",
    startQueueBtn: "开始下载队列",
    clearQueueBtn: "清空队列",
    emptyQueuePrompt: "下载队列为空。请在工作台表格中勾选格式并点击“加入下载队列”。",
    queueProcessing: "正在处理下载队列...",
    queueDone: "队列中的所有下载任务已全部完成！",

    // ── Tab 3: Advanced & Tuning ──
    advSpeedTitle: "⚡ 速度优化与网络配置",
    advRetriesLabel: "解析重试次数 (Retries)",
    advRateLimitLabel: "下载限速 (Rate Limit)",
    advRateLimitPlaceholder: "例如: 500K, 2M (留空表示不限速)",
    advBiliCdnTitle: "🚀 哔哩哔哩 CDN 优化与防 P2P 限速 (Bilibili Anti-P2P & UPOS Selector)",
    biliAvoidP2pLabel: "自动绕过 P2P / MCDN 节点 (推荐)",
    biliAvoidP2pTip: "自动检测并过滤容易限速卡顿的 P2P/MCDN 节点 (mcdn.bilivideo.cn, szbdyd.com)，切换到官方高速骨干 CDN 服务器。",
    biliAvoidP2pActive: "🛡️ 已开启 (自动绕过限速节点)",
    biliAvoidP2pInactive: "⚠️ 已关闭 (可能连接到较慢的 P2P 节点)",
    biliUposHostLabel: "哔哩哔哩 CDN 节点服务器 (UPOS Server)",
    biliUposHostTip: "选择下载哔哩哔哩视频的 UPOS CDN 服务器。阿里海外 (mirroraliov) 与腾讯海外 (mirrorcosov) 在海外及国际网络具有最高且最稳定的下载速度。",
    biliUposAuto: "⚡ 自动优选 (优先阿里 / 腾讯海外 CDN)",
    biliUposAliOv: "🌏 阿里海外 CDN (upos-sz-mirroraliov) — 国际加速首选",
    biliUposCosOv: "🌐 腾讯海外 CDN (upos-sz-mirrorcosov) — 国际优化",
    biliUposAkam: "⚡ Akamai 全球 CDN (upos-hz-mirrorakam) — 全球节点",
    biliUposAli: "🚀 阿里云国内节点 (upos-sz-mirrorali)",
    biliUposCos: "🛡️ 腾讯云国内节点 (upos-sz-mirrorcos)",
    biliUposHw: "🌐 华为云国内节点 (upos-sz-mirrorhw)",
    biliUposBos: "🏢 百度云国内节点 (upos-sz-mirrorbos)",
    biliUposRaw: "🔄 保持 Bilibili 原始 CDN (允许 P2P)",
    advPostTitle: "🎬 格式转码与后期处理",
    advRecodeLabel: "视频重新转码为 (Recode Video)",
    advAudioFormatLabel: "单独提取音频为 (Extract Audio)",
    advConvertThumbLabel: "封面图片格式转换",
    advSecurityTitle: "🛡️ 运行策略与安全",
    advUsernameLabel: "登录用户名 / 邮箱",
    advPasswordLabel: "登录密码",
    advGeoBypass: "绕过地区限制 (Geo Bypass)",
    advForceIpv4: "强制使用 IPv4 连接",
    advRestrictFilenames: "文件名仅限制为 ASCII 字符",
    advNoOverwrites: "不覆盖已存在的同名文件",

    // ── Tab 4: Settings ──
    settingsPathTitle: "📁 存储路径与命名规则",
    settingsFolderLabel: "默认视频下载保存目录",
    settingsTemplateLabel: "输出文件名命名模板",
    settingsProxyTitle: "🌐 网络与代理",
    settingsProxyLabel: "代理服务器地址 (Proxy)",
    settingsUserAgentLabel: "自定义 User-Agent",
    settingsLangTitle: "🌍 界面语言设置 (Interface Language)",
    settingsLangLabel: "选择界面显示语言：",

    // ── Toast Messages ──
    toastInputUrl: "请输入有效的视频链接",
    toastAnalyzing: "正在深入解析视频流...",
    toastDirectStream: "已直接解析出高速直链！",
    toastFetchError: "获取视频信息失败",
    toastFolderChosen: "已成功保存默认下载目录：\n",
    toastThumbDownloading: "⏳ 正在下载高清封面图...",
    toastThumbSuccess: "🎉 高清封面下载成功！\n已保存至：",
    toastThumbError: "⚠️ 下载封面失败",
    toastSubSuccess: "🎉 字幕文件下载成功：",
    toastDlSuccess: "🎉 文件下载成功！",
    toastDlCancelled: "下载任务已取消",
    toastDlPaused: "下载已暂停",
    toastDlResumed: "继续下载中...",
  },

  ja: {
    // ── Brand & Meta ──
    appTitle: "EveryVideoDownloader — メディアダウンローダー ワークステーション (yt-dlp 搭載)",
    brandSub: "POWERED BY YT-DLP",

    // ── Topbar Search & Cookies ──
    urlPlaceholder: "動画リンクを貼り付け (YouTube, TikTok, Bilibili, Facebook, Douyin, X...)",
    cookieTitle: "ブラウザのクッキー (任意)",
    cookieDefault: "デフォルト",
    analyzeBtn: "解析 (-F)",
    analyzingBtn: "解析中...",
    themeToggleTitle: "ライト / ダーク モード切り替え",

    // ── Navigation Tabs ──
    tabStudio: "スタジオ",
    tabQueue: "キュー",
    tabAdvanced: "高度な設定",
    tabSettings: "システム設定",

    // ── Sidebar: Empty Hero Guide ──
    emptyHeroTitle: "ダウンロードの準備完了",
    emptyHeroDesc: "上部の検索バーに動画リンクを貼り付け、<strong>解析 (-F)</strong> をクリックすると、利用可能なすべての解像度とフォーマットを抽出します。",
    otherSites: "1000+ の主要サイトに対応",

    // ── Sidebar: Hero Metadata ──
    dlThumbBtn: "サムネイル保存",
    dlThumbBtnLoading: "保存中...",
    channelLabel: "投稿者 / チャンネル",
    viewsLabel: "回視聴",
    formatsCount: "フォーマット",
    subsCount: "字幕",
    originalTitleLabel: "元の動画タイトル",
    transTitleLabel: "日本語翻訳タイトル：",
    translatingText: "タイトルを翻訳中...",
    customFileNameLabel: "ダウンロードファイル名:",
    customFileNamePlaceholder: "保存するファイル名を入力...",
    useOriginalName: "元の名前",
    useTranslatedName: "翻訳名",
    cleanFileName: "クリーン",

    // ── Sidebar: Quick Subtitle ──
    quickSubTitle: "字幕の抽出とクイックダウンロード",
    quickSubSelectLabel: "字幕の言語を選択：",
    quickSubNone: "(利用可能な字幕はありません)",
    quickDlSrt: ".SRT 保存",
    quickDlVtt: ".VTT 保存",
    quickPreviewSub: "プレビュー",

    // ── Sidebar: Speed & Destination ──
    speedCardTitle: "高速化設定 & 保存先フォルダ",
    saveFolderLabel: "保存先フォルダ：",
    openFolderBtn: "フォルダを開く",
    changeFolderBtn: "変更...",
    containerLabel: "コンテナ形式：",
    containerAuto: "🔄 自動",
    threadsLabel: "マルチスレッド (-N)：",
    threads1: "🛡️ 1 スレッド (デフォルト - 最も安定)",
    threads4: "⚡ 4 スレッド (安全な高速化)",
    threads8: "🚀 8 スレッド (高速回線)",
    threads16: "🔥 16 スレッド (超高速)",
    chunkSizeLabel: "チャンクサイズ：",
    chunk10M: "⭐ 10 MB (チャンク分割)",
    chunk5M: "🛡️ 5 MB (低速回線 / 4G)",
    chunk2M: "⚡ 2 MB",
    chunk1M: "🐢 1 MB",
    chunk20M: "🚀 20 MB (高速回線)",
    chunk50M: "🔥 50 MB",
    chunk100M: "⚡ 100 MB",
    chunkOff: "🔄 オフ (デフォルト - 連続ストリーム)",
    switchSubtitles: "字幕",
    switchThumbnail: "サムネイル",
    switchMetadata: "メタデータ",
    switchPlaylist: "プレイリスト",

    // ── Main Explorer Toolbar ──
    filterAll: "すべて",
    filterVideo: "🎬 映像のみ",
    filterAudio: "🎵 音声のみ",
    filterCombo: "🎥 映像+音声",
    filterSubs: "💬 字幕リスト",
    searchPlaceholder: "ID, コーデック (av01, hvc1, avc), 1080p, mp4 を検索...",
    viewTableTitle: "詳細テーブル表示 (ソート & 複数選択対応)",
    viewCardsTitle: "クイックカード表示",
    selectedCountPrefix: "選択中: ",
    selectedCountSuffix: " 個の形式",
    addSelectedToQueue: "選択項目をキューに追加",

    // ── Formats Table Headers ──
    thSelectAll: "すべて選択",
    thId: "ID",
    thResolution: "解像度",
    thExt: "拡張子",
    thFps: "FPS",
    thVCodec: "動画コーデック",
    thACodec: "音声コーデック",
    thBitrate: "ビットレート",
    thSize: "ファイル容量",
    thNotes: "詳細 / 備考",
    emptyTablePrompt: "フォーマットデータがありません。動画リンクを入力して <strong>解析 (-F)</strong> を押してください。",

    // ── Subtitles Table ──
    subsListTitle: "抽出された字幕リスト",
    subsSearchPlaceholder: "言語を絞り込み (日本語, 英語, 中国語...)",
    subsThLang: "言語名",
    subsThCode: "言語コード & タイプ",
    subsThFormat: "形式",
    subsThAction: "ダウンロード & プレビュー",
    emptySubsPrompt: "字幕データがありません。<strong>解析 (-F)</strong> を実行してください。",

    // ── Audio Merge Bar ──
    audioMergeEnable: "最高音質の音声を自動合成 (推奨)",
    audioMergeTrackLabel: "音声トラック：",
    audioMergeBest: "🌟 Best Audio (最高音質を自動選択)",

    // ── CTA Download Card ──
    formatFlagLabel: "フォーマット指定：",
    customFormatPlaceholder: "フォーマットコードを入力...",
    editFormatManual: "フォーマットを手動編集",
    startDownloadBtn: "ダウンロード開始",
    downloadingBtn: "ダウンロード中...",

    // ── Real-Time Loading & Progress Card ──
    statusPreparing: "準備中...",
    statusDownloading: "ダウンロード中",
    statusCompleted: "完了",
    statusPaused: "一時停止中",
    statusCancelled: "キャンセル済み",
    metricSpeedPrefix: "⚡ 速度: ",
    metricEtaPrefix: "⏱️ 残り時間: ",
    metricSizePrefix: "📦 容量: ",
    successAlertTitle: "🎉 ダウンロードが正常に完了しました！",
    successAlertSub: "ファイルはお使いのPCの保存フォルダに保存されました",
    openSavedFolderBtn: "📂 保存先フォルダを開く",
    pauseBtn: "一時停止",
    resumeBtn: "再開",
    cancelBtn: "キャンセル",
    toggleLogsBtn: "ログ表示",

    // ── Subtitle Preview Modal ──
    subModalTitle: "字幕プレビュー",
    subModalLoading: "字幕データを読み込み中...",
    subModalMeta: "冒頭のセリフサンプルを表示中",
    modalDlSrt: ".SRT をダウンロード",
    modalDlVtt: ".VTT をダウンロード",

    // ── Tab 2: Queue ──
    queueTitle: "📋 ダウンロードキュー管理",
    queueDesc: "キュー内のタスクはバックグラウンドで自動的に順次処理されます。",
    startQueueBtn: "キューのダウンロード開始",
    clearQueueBtn: "キューをクリア",
    emptyQueuePrompt: "キューは空です。スタジオのテーブルからフォーマットを選択して「キューに追加」を押してください。",
    queueProcessing: "キューを処理中...",
    queueDone: "キュー内のすべてのタスクが完了しました！",

    // ── Tab 3: Advanced & Tuning ──
    advSpeedTitle: "⚡ 速度最適化 & ネットワーク設定",
    advRetriesLabel: "解析リトライ回数 (Retries)",
    advRateLimitLabel: "速度制限 (Rate Limit)",
    advRateLimitPlaceholder: "例: 500K, 2M (空白 = 無制限)",
    advBiliCdnTitle: "🚀 Bilibili CDN 最適化 & P2P 速度制限回避 (Anti-P2P & UPOS Selector)",
    biliAvoidP2pLabel: "P2P / MCDN ノードを自動回避 (推奨)",
    biliAvoidP2pTip: "低速になりやすい P2P/MCDN ノード (mcdn.bilivideo.cn, szbdyd.com) を自動検知して除外し、公式の高速バックボーン CDN サーバーに切り替えます。",
    biliAvoidP2pActive: "🛡️ 有効 (低速ノードを自動回避)",
    biliAvoidP2pInactive: "⚠️ 無効 (低速な P2P ノードに接続される可能性があります)",
    biliUposHostLabel: "Bilibili CDN サーバー (UPOS Server)",
    biliUposHostTip: "Bilibili 動画ダウンロード用 UPOS サーバーを選択します。Alibaba 海外 CDN (mirroraliov) および Tencent 海外 (mirrorcosov) は日本・海外で最高速度と安定性を発揮します。",
    biliUposAuto: "⚡ 自動選択 (海外 Alibaba / Tencent CDN 優先)",
    biliUposAliOv: "🌏 Alibaba 海外 CDN (upos-sz-mirroraliov) — 最速 & 高安定性",
    biliUposCosOv: "🌐 Tencent 海外 CDN (upos-sz-mirrorcosov) — 国際最適化",
    biliUposAkam: "⚡ Akamai グローバル CDN (upos-hz-mirrorakam) — グローバル帯域",
    biliUposAli: "🚀 Alibaba Cloud 中国国内 (upos-sz-mirrorali)",
    biliUposCos: "🛡️ Tencent Cloud 中国国内 (upos-sz-mirrorcos)",
    biliUposHw: "🌐 Huawei Cloud 中国国内 (upos-sz-mirrorhw)",
    biliUposBos: "🏢 Baidu Cloud 中国国内 (upos-sz-mirrorbos)",
    biliUposRaw: "🔄 元の Bilibili CDN を保持 (P2P を許可)",
    advPostTitle: "🎬 フォーマット変換 & 後処理",
    advRecodeLabel: "動画を再エンコード (Recode Video)",
    advAudioFormatLabel: "音声のみ抽出 (Extract Audio)",
    advConvertThumbLabel: "サムネイル形式変換",
    advSecurityTitle: "🛡️ 動作設定 & セキュリティ",
    advUsernameLabel: "ユーザー名 / メールアドレス",
    advPasswordLabel: "パスワード",
    advGeoBypass: "地域制限を回避 (Geo Bypass)",
    advForceIpv4: "IPv4 接続を強制",
    advRestrictFilenames: "ファイル名を ASCII 文字のみに制限",
    advNoOverwrites: "既存のファイルを上書きしない",

    // ── Tab 4: Settings ──
    settingsPathTitle: "📁 保存先 & ファイル名テンプレート",
    settingsFolderLabel: "デフォルト保存先フォルダ",
    settingsTemplateLabel: "出力ファイル名テンプレート",
    settingsProxyTitle: "🌐 ネットワーク & プロキシ",
    settingsProxyLabel: "プロキシサーバーのアドレス",
    settingsUserAgentLabel: "カスタム User-Agent",
    settingsLangTitle: "🌍 インターフェース言語 (Interface Language)",
    settingsLangLabel: "表示言語を選択：",

    // ── Toast Messages ──
    toastInputUrl: "有効な動画リンクを入力してください",
    toastAnalyzing: "動画ストリームを解析中...",
    toastDirectStream: "高速ダイレクトストリームを抽出しました！",
    toastFetchError: "動画情報の取得に失敗しました",
    toastFolderChosen: "新しい保存先フォルダを保存しました：\n",
    toastThumbDownloading: "⏳ 高画質サムネイルをダウンロード中...",
    toastThumbSuccess: "🎉 サムネイルの保存が完了しました！\n保存先: ",
    toastThumbError: "⚠️ サムネイルの保存に失敗しました",
    toastSubSuccess: "🎉 字幕の保存が完了しました: ",
    toastDlSuccess: "🎉 ファイルのダウンロードが完了しました！",
    toastDlCancelled: "ダウンロード処理がキャンセルされました",
    toastDlPaused: "ダウンロードを一時停止しました",
    toastDlResumed: "ダウンロードを再開中...",
  }
};

// Current active language code
let currentAppLanguage = localStorage.getItem('appLanguage') || 'vi';
if (!I18N[currentAppLanguage]) {
  currentAppLanguage = 'vi';
}

/**
 * Get translated text for a key
 * @param {string} key
 * @param {string} [lang]
 * @returns {string}
 */
function t(key, lang = currentAppLanguage) {
  const dict = I18N[lang] || I18N['vi'];
  return dict[key] || I18N['vi'][key] || key;
}

/**
 * Apply translations to all DOM elements with data-i18n attributes
 * @param {string} lang
 */
function applyLanguage(lang) {
  if (!I18N[lang]) lang = 'vi';
  currentAppLanguage = lang;
  localStorage.setItem('appLanguage', lang);
  document.documentElement.setAttribute('lang', lang);

  // 1. Text Content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key, lang);
    if (val) {
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = val;
      } else {
        el.innerHTML = val;
      }
    }
  });

  // 2. Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key, lang);
    if (val) el.setAttribute('placeholder', val);
  });

  // 3. Titles / Tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key, lang);
    if (val) el.setAttribute('title', val);
  });

  // 4. Update dynamic select elements
  const topLangSelect = document.getElementById('appLanguageSelect');
  if (topLangSelect && topLangSelect.value !== lang) topLangSelect.value = lang;

  const settingsLangSelect = document.getElementById('settingsLanguageSelect');
  if (settingsLangSelect && settingsLangSelect.value !== lang) settingsLangSelect.value = lang;

  // 5. Update dynamic translation title box label if present
  const transLabel = document.querySelector('#videoTranslatedBox .trans-label span');
  if (transLabel) {
    if (lang === 'vi') transLabel.textContent = 'Tiếng Việt (Google Dịch):';
    else if (lang === 'en') transLabel.textContent = 'English Translation:';
    else if (lang === 'zh') transLabel.textContent = '中文翻译：';
    else if (lang === 'ja') transLabel.textContent = '日本語翻訳：';
  }

  // 6. Notify active view re-rendering if needed
  if (typeof window.onLanguageChanged === 'function') {
    window.onLanguageChanged(lang);
  }
}

// Export for global access
window.I18N = I18N;
window.t = t;
window.applyLanguage = applyLanguage;
window.currentAppLanguage = currentAppLanguage;
