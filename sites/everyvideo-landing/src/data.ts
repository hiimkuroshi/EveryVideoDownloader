export type Locale = "vi" | "en" | "ja";
export const REPOSITORY = "https://github.com/hiimkuroshi/EveryVideoDownloader";
export const RELEASE = `${REPOSITORY}/releases/tag/v1.2.0`;
export const DOWNLOADS = {
  setup: `${REPOSITORY}/releases/download/v1.2.0/EveryVideo-1.2.0-Setup-x64.exe`,
  portable: `${REPOSITORY}/releases/download/v1.2.0/EveryVideo-1.2.0-Portable-Folder-x64.zip`,
  checksums: `${REPOSITORY}/releases/download/v1.2.0/SHA256SUMS.txt`,
};
export const pageCopy = {
  vi: {
    explore: "Khám phá",
    features: "Tính năng",
    guide: "Hướng dẫn",
    settings: "Cài đặt",
    download: "Tải cho Windows",
    headline: ["Giữ lại", "những điều", "đáng xem"],
    description: "Tải video, âm thanh và phụ đề về không gian của bạn.",
    watch: "Xem cách hoạt động",
    availability: "Dành cho Windows · Cài đặt hoặc portable",
    featureEyebrow: "MỘT ỨNG DỤNG. NHIỀU ĐỊNH DẠNG.",
    featureTitle: "Mọi phần của câu chuyện",
    featureItems: [
      {
        title: "Video",
        subtitle: "Chọn chất lượng phù hợp",
        description:
          "Chọn độ phân giải và định dạng phù hợp như MP4, giúp cân bằng giữa chất lượng và dung lượng lưu trữ.",
      },
      {
        title: "Âm thanh",
        subtitle: "Chỉ giữ phần bạn muốn nghe",
        description:
          "Tải riêng âm thanh với nhiều định dạng phổ biến, phù hợp cho việc nghe ngoại tuyến hoặc lưu trữ.",
      },
      {
        title: "Phụ đề",
        subtitle: "Lưu lời thoại cùng nội dung",
        description:
          "Tải phụ đề khi nguồn có hỗ trợ, để dễ dàng xem lại, học tập hoặc thưởng thức trọn vẹn nội dung.",
      },
    ],
    subtitleSample:
      "Những hành trình đẹp nhất\nthường bắt đầu từ những điều giản dị.",
    platformNote: "Khả năng tải và chất lượng tùy nguồn.",
    finalTitle: "Dán link. Chọn chất lượng. Lưu về máy",
    local: "Chạy trên máy của bạn.",
    theme: "Đổi giao diện sáng/tối",
    language: "Ngôn ngữ",
    menu: "Mở menu điều hướng",
    close: "Đóng",
    skip: "Bỏ qua đến nội dung chính",
    helpTitle: "Từ một đường link,\nđến bộ sưu tập của bạn.",
    helpIntro: "Ba bước trong ứng dụng EveryVideo trên máy tính.",
    steps: [
      {
        title: "Dán đường link",
        text: "Mở EveryVideo, dán URL trang web hoặc media rồi chọn Phân tích.",
      },
      {
        title: "Chọn cách lưu",
        text: "Chọn video, âm thanh hoặc phụ đề có sẵn. Xem chất lượng và định dạng trước khi tải.",
      },
      {
        title: "Lưu về máy",
        text: "Chọn thư mục, tải xuống hoặc thêm vào hàng chờ. Theo dõi tiến độ ngay trong ứng dụng.",
      },
    ],
    helpNote:
      "Chỉ tải nội dung bạn có quyền lưu. Một số nguồn, nội dung riêng tư hoặc DRM có thể không tải được.",
    downloadTitle: "Không gian của bạn.\nBắt đầu từ đây.",
    downloadIntro: "EveryVideo dành cho Windows x64. Miễn phí sử dụng.",
    installer: "Bản cài đặt",
    installerText: "Cài một lần, có phím tắt và trình gỡ cài đặt.",
    portable: "Bản portable (ZIP)",
    portableText: "Giải nén toàn bộ, sau đó mở EveryVideo.exe.",
    release: "Thông tin phiên bản",
    checksum: "Mã kiểm tra tệp",
    downloadNote:
      "Bản phát hành hiện chưa ký số. Với bản portable, hãy giữ các tệp đi kèm trong cùng thư mục.",
    source: "Xem mã nguồn trên GitHub",
  },
  en: {
    explore: "Explore",
    features: "Features",
    guide: "How it works",
    settings: "Settings",
    download: "Get for Windows",
    headline: ["Keep the", "things worth", "watching"],
    description: "Bring video, audio and subtitles into your own space.",
    watch: "See how it works",
    availability: "For Windows · Installer or portable",
    featureEyebrow: "ONE APP. EVERY PART OF THE STORY.",
    featureTitle: "Keep the whole story",
    featureItems: [
      {
        title: "Video",
        subtitle: "Find your kind of quality",
        description:
          "Choose the available resolution and format, such as MP4, to balance image quality with storage space.",
      },
      {
        title: "Audio",
        subtitle: "Just the part you want to hear",
        description:
          "Save available audio in popular formats, ready for offline listening or your own collection.",
      },
      {
        title: "Subtitles",
        subtitle: "Keep the words with the story",
        description:
          "Save subtitles when the source provides them. Revisit, learn and enjoy the full context.",
      },
    ],
    subtitleSample:
      "The most beautiful journeys\noften begin with the simplest things.",
    platformNote: "Availability and quality depend on the source.",
    finalTitle: "Paste a link. Pick your quality. Keep it",
    local: "Runs on your computer.",
    theme: "Switch light/dark theme",
    language: "Language",
    menu: "Open navigation menu",
    close: "Close",
    skip: "Skip to main content",
    helpTitle: "From a link,\nto a collection of your own.",
    helpIntro: "Three steps in the EveryVideo desktop application.",
    steps: [
      {
        title: "Paste a link",
        text: "Open EveryVideo, paste a webpage or media URL, and choose Analyze.",
      },
      {
        title: "Choose how to save",
        text: "Select available video, audio or subtitles. Inspect quality and formats before downloading.",
      },
      {
        title: "Make it yours",
        text: "Choose a folder, download or add to your queue. Follow progress directly in the app.",
      },
    ],
    helpNote:
      "Only download content you have permission to save. Some private, protected or DRM sources may be unavailable.",
    downloadTitle: "Your own space.\nStart here.",
    downloadIntro: "EveryVideo for Windows x64. Free to use.",
    installer: "Windows installer",
    installerText: "Set up once, with shortcuts and an uninstaller.",
    portable: "Portable folder (ZIP)",
    portableText: "Extract everything, then open EveryVideo.exe.",
    release: "Release notes",
    checksum: "File checksums",
    downloadNote:
      "The current release is unsigned. Keep all extracted companion files together when using the portable version.",
    source: "Explore the source on GitHub",
  },
  ja: {
    explore: "機能紹介",
    features: "特徴",
    guide: "使い方",
    settings: "設定",
    download: "Windows版を入手",
    headline: ["手元に残す、", "心動かす", "瞬間を"],
    description: "動画、音声、字幕をあなただけの空間へ保存。",
    watch: "使い方を見る",
    availability: "Windows対応 · インストーラー版 / ポータブル版",
    featureEyebrow: "ひとつのアプリで、あらゆるフォーマットを。",
    featureTitle: "物語のすべてをそのままに",
    featureItems: [
      {
        title: "動画",
        subtitle: "最適な画質を選択",
        description:
          "MP4などの対応フォーマットや解像度を選び、高画質と保存容量のバランスを思い通りに調整できます。",
      },
      {
        title: "音声",
        subtitle: "聴きたい音だけを抽出",
        description:
          "オフライン再生やお気に入りのコレクション用に、動画から音声のみを抽出して汎用形式で保存します。",
      },
      {
        title: "字幕",
        subtitle: "言葉もストーリーと一緒に",
        description:
          "配信元が提供する字幕データを一緒に保存。語学学習や見返し、正確なセリフの確認に役立ちます。",
      },
    ],
    subtitleSample:
      "「最も美しい旅は、\nいつもささやかな一歩から始まる。」",
    platformNote: "ダウンロードの可否や画質は配信元の仕様に依存します。",
    finalTitle: "リンクを貼る。画質を選ぶ。手元に残す",
    local: "PCローカル環境で安全に動作。",
    theme: "ライト / ダークテーマ切り替え",
    language: "言語",
    menu: "メニューを開く",
    close: "閉じる",
    skip: "メインコンテンツへスキップ",
    helpTitle: "ひとつのリンクから、\nあなただけのコレクションへ。",
    helpIntro: "Windowsデスクトップアプリでの簡単3ステップ。",
    steps: [
      {
        title: "リンクを貼り付け",
        text: "EveryVideoを開き、Webページや動画のURLを貼り付けて「解析」をクリックします。",
      },
      {
        title: "保存方法を選択",
        text: "利用可能な動画、音声、字幕を選択。ダウンロード前に画質や形式を確認できます。",
      },
      {
        title: "パソコンに保存",
        text: "保存先フォルダを指定し、すぐに保存するかキューに追加。進捗はアプリ内で確認できます。",
      },
    ],
    helpNote:
      "ご自身が保存権限を持つコンテンツのみをダウンロードし、配信元の利用規約を遵守してください。DRM保護や非公開コンテンツには対応していません。",
    downloadTitle: "あなただけの空間を、\nここから始めよう。",
    downloadIntro: "EveryVideo for Windows x64. 完全無料でご利用いただけます。",
    installer: "Windows インストーラー版",
    installerText: "ショートカット作成とアンインストーラー付き。",
    portable: "ポータブル版 (ZIP)",
    portableText: "フォルダ全体を展開し、EveryVideo.exe を起動するだけ。",
    release: "リリースノート",
    checksum: "SHA-256 チェックサム",
    downloadNote:
      "現在のリリース版は電子署名が未付与です。ポータブル版は同封のファイルをすべて同じフォルダに保持してください。",
    source: "GitHubでソースコードを見る",
  },
};
