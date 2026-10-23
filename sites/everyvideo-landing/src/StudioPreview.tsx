"use client";
import { useState } from "react";
import {
  House,
  Stack,
  SlidersHorizontal,
  GearSix,
  Link as LinkIcon,
  X,
  Minus,
  Square,
  Monitor,
  MusicNotes,
  ClosedCaptioning,
  ImageSquare,
  DownloadSimple,
  Plus,
  Trash,
  ArrowRight,
  Check,
  Play,
} from "@phosphor-icons/react";
import type { Locale } from "./data";
export type StudioView = "studio" | "queue" | "advanced" | "settings";
type MediaKind = "video" | "audio" | "subtitles" | "thumbnail";
const wording = {
  vi: {
    tabs: ["Studio", "Hàng chờ", "Nâng cao", "Cài đặt"],
    preview: "Bản xem trước",
    link: "Liên kết minh họa",
    analyze: "Phân tích",
    title: "Hành trình qua những miền xanh",
    meta: "Video minh họa · 08:24",
    description:
      "Những khung cảnh tuyệt đẹp từ núi non, hồ nước và những cung đường đáng nhớ trong hành trình khám phá thiên nhiên.",
    media: ["Video", "Âm thanh", "Phụ đề", "Hình thu nhỏ"],
    quality: "Chọn chất lượng",
    download: "Tải xuống",
    add: "Thêm vào hàng chờ minh họa",
    notice:
      "Giao diện minh họa. Phân tích và tải media thật trong ứng dụng Windows.",
    analyzed:
      "Liên kết thật được phân tích trong ứng dụng. Bạn có thể thử chọn định dạng với nội dung minh họa tại đây.",
    formatExample: "Định dạng minh họa · Tùy nguồn",
    queueEmpty: "Một hàng chờ, mọi thứ gọn gàng.",
    queueHint: "Thêm nội dung từ Studio để thử cách sắp xếp trước khi tải.",
    queued: "Mục minh họa",
    remove: "Xóa mục khỏi hàng chờ",
    added: "Đã thêm nội dung minh họa vào hàng chờ.",
    advancedTitle: "Thêm một chút kiểm soát.",
    advancedIntro: "Các tùy chọn minh họa dựa trên ứng dụng EveryVideo.",
    engine: "Công cụ tải",
    connections: "Kết nối",
    subtitles: "Lưu kèm phụ đề nếu có",
    thumbnail: "Lưu kèm hình thu nhỏ",
    settingsTitle: "Không gian của riêng bạn.",
    folder: "Thư mục tải mặc định",
    language: "Ngôn ngữ ứng dụng",
    settingsNote:
      "Thư mục và cấu hình thật được chọn trong ứng dụng trên máy của bạn.",
    back: "Về Studio",
    best: "Chất lượng tốt nhất",
    source: "Theo nguồn",
    sample: "Mẫu",
  },
  en: {
    tabs: ["Studio", "Queue", "Advanced", "Settings"],
    preview: "Interactive preview",
    link: "Example link",
    analyze: "Analyze",
    title: "A journey through greener places",
    meta: "Illustrative video · 08:24",
    description:
      "A journey through mountain peaks, quiet lakes and the winding paths that make the natural world worth exploring.",
    media: ["Video", "Audio", "Subtitles", "Thumbnail"],
    quality: "Choose quality",
    download: "Download",
    add: "Add to the example queue",
    notice:
      "Interface preview. Analyze and download real media in the Windows app.",
    analyzed:
      "Real links are analyzed in the app. Try the format controls here with illustrative content.",
    formatExample: "Example formats · Source dependent",
    queueEmpty: "One queue. Everything in order.",
    queueHint: "Add the example from Studio to try organising a download.",
    queued: "Example item",
    remove: "Remove from queue",
    added: "Example content added to the queue.",
    advancedTitle: "A little more control.",
    advancedIntro: "Illustrative settings based on the EveryVideo application.",
    engine: "Download engine",
    connections: "Connections",
    subtitles: "Save subtitles when available",
    thumbnail: "Save the thumbnail",
    settingsTitle: "A space of your own.",
    folder: "Default download folder",
    language: "App language",
    settingsNote:
      "Choose your real folders and settings in the application on your computer.",
    back: "Back to Studio",
    best: "Best available",
    source: "Source dependent",
    sample: "Example",
  },
  ja: {
    tabs: ["Studio", "キュー", "高度な設定", "環境設定"],
    preview: "インタラクティブプレビュー",
    link: "サンプルURL",
    analyze: "解析する",
    title: "緑豊かな地をめぐる旅",
    meta: "サンプル動画 · 08:24",
    description:
      "山々の峰、静寂な湖、そして自然の美しさを感じる小道。手元に残しておきたい旅の記録。",
    media: ["動画", "音声", "字幕", "サムネイル"],
    quality: "品質を選択",
    download: "ダウンロード",
    add: "サンプルのキューに追加",
    notice:
      "UIプレビューです。実際のリンク解析とダウンロードはWindowsアプリで行います。",
    analyzed:
      "実際のリンクはアプリ内で解析されます。ここではサンプルコンテンツで操作感をお試しいただけます。",
    formatExample: "サンプル形式 · 配信元に依存",
    queueEmpty: "ひとつのキューで、すべてを整頓。",
    queueHint: "Studioからコンテンツを追加して、ダウンロードの整理をお試しください。",
    queued: "キュー内の項目",
    remove: "キューから削除",
    added: "サンプルコンテンツをキューに追加しました。",
    advancedTitle: "こだわりに応える設定。",
    advancedIntro: "EveryVideoアプリの高度な機能を体験できるサンプル設定です。",
    engine: "ダウンロードエンジン",
    connections: "同時接続数",
    subtitles: "利用可能な場合は字幕も保存",
    thumbnail: "サムネイル画像も保存",
    settingsTitle: "あなただけの作業空間。",
    folder: "既定の保存先フォルダ",
    language: "アプリの言語",
    settingsNote:
      "実際の保存先や詳細設定は、お手元のPCのアプリ内で行います。",
    back: "Studioへ戻る",
    best: "最高画質",
    source: "配信元に依存",
    sample: "サンプル",
  },
};
const views: StudioView[] = ["studio", "queue", "advanced", "settings"];
const mediaKinds: MediaKind[] = ["video", "audio", "subtitles", "thumbnail"];
const viewIcons = [House, Stack, SlidersHorizontal, GearSix];
const mediaIcons = [Monitor, MusicNotes, ClosedCaptioning, ImageSquare];

export default function StudioPreview({
  locale,
  view,
  onView,
  onDownload,
  onLocale,
}: {
  locale: Locale;
  view: StudioView;
  onView: (view: StudioView) => void;
  onDownload: () => void;
  onLocale: (locale: Locale) => void;
}) {
  const text = wording[locale];
  const [media, setMedia] = useState<MediaKind>("video");
  const [quality, setQuality] = useState("720p");
  const [queueItem, setQueueItem] = useState<{
    format: string;
    media: MediaKind;
  } | null>(null);
  const queued = queueItem !== null;
  const [message, setMessage] = useState<"" | "analyzed" | "added">("");
  const [url, setUrl] = useState("https://example.com/hanh-trinh-mien-xanh");
  const [engine, setEngine] = useState("Auto");
  const [connections, setConnections] = useState("8");
  const [withSubtitles, setWithSubtitles] = useState(true);
  const [withThumbnail, setWithThumbnail] = useState(false);
  const formats =
    media === "audio"
      ? ["M4A", "MP3", "Opus"]
      : media === "subtitles"
        ? ["SRT", "VTT"]
        : media === "thumbnail"
          ? ["JPG", "PNG"]
          : ["1080p", "720p", "480p", "360p"];
  const selection = formats.includes(quality) ? quality : formats[0];
  function pickMedia(kind: MediaKind) {
    setMedia(kind);
    setQuality(
      kind === "video"
        ? "720p"
        : kind === "audio"
          ? "M4A"
          : kind === "subtitles"
            ? "SRT"
            : "JPG",
    );
  }
  return (
    <section
      id="studio"
      className="studio-window"
      aria-label={
        locale === "vi"
          ? "Bản xem trước EveryVideo"
          : locale === "ja"
            ? "EveryVideo インターフェースプレビュー"
            : "EveryVideo interface preview"
      }
    >
      <h2 className="sr-only">
        {locale === "vi"
          ? "Khám phá Studio EveryVideo"
          : locale === "ja"
            ? "EveryVideo Studioを体験"
            : "Explore the EveryVideo studio"}
      </h2>
      <div className="studio-chrome">
        <a className="studio-brand" href="#khampha">
          <Play className="studio-play" size={26} aria-hidden="true" />
          EveryVideo
        </a>
        <div
          className="studio-tabs"
          role="tablist"
          aria-label={
            locale === "vi"
              ? "Khu vực ứng dụng"
              : locale === "ja"
                ? "アプリアクション"
                : "App sections"
          }
        >
          {views.map((item, index) => {
            const Icon = viewIcons[index];
            return (
              <button
                key={item}
                role="tab"
                id={`view-${item}`}
                aria-selected={view === item}
                aria-controls="studio-view"
                tabIndex={view === item ? 0 : -1}
                onClick={() => onView(item)}
                onKeyDown={(event) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 3
                        : (index + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                  onView(views[next]);
                  document.getElementById(`view-${views[next]}`)?.focus();
                }}
              >
                <Icon
                  size={18}
                  weight={view === item ? "fill" : "regular"}
                  aria-hidden="true"
                />
                {text.tabs[index]}
                {item === "queue" && queued && (
                  <span className="queue-count">1</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="window-controls" aria-hidden="true">
          <Minus size={14} />
          <Square size={12} />
          <X size={15} />
        </div>
      </div>
      <div className="studio-inner">
        <form
          className="analyze-form"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("analyzed");
            onView("studio");
          }}
        >
          <div className="url-field">
            <LinkIcon size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="preview-url">
              {text.link}
            </label>
            <input
              id="preview-url"
              type="url"
              value={url}
              required
              onChange={(event) => setUrl(event.target.value)}
              spellCheck={false}
            />
            <button
              type="button"
              className="clear-url"
              aria-label={
                locale === "vi"
                  ? "Xóa liên kết"
                  : locale === "ja"
                    ? "URLを消去"
                    : "Clear link"
              }
              onClick={() => setUrl("")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <button
            type="submit"
            className="button button-primary analyze-button"
          >
            {text.analyze}
          </button>
        </form>
        <div id="studio-view" role="tabpanel" aria-labelledby={`view-${view}`}>
          {view === "studio" ? (
            <div className="studio-content">
              <div className="video-summary">
                <div className="preview-thumbnail">
                  <img
                    src="/images/cinema-hero-768.webp"
                    alt={
                      locale === "vi"
                        ? "Núi và hồ nước lúc hoàng hôn, hình minh họa video"
                        : locale === "ja"
                          ? "夕暮れの山と湖、サンプル動画のサムネイル"
                          : "Mountains and a lake at sunset, illustrative video thumbnail"
                    }
                    width="768"
                    height="512"
                  />
                  <span>08:24</span>
                </div>
                <div className="video-description">
                  <h3>{text.title}</h3>
                  <span className="video-meta">{text.meta}</span>
                  <p>{text.description}</p>
                </div>
              </div>
              <div
                className="media-tabs"
                role="tablist"
                aria-label={
                  locale === "vi"
                    ? "Loại media"
                    : locale === "ja"
                      ? "メディア形式"
                      : "Media type"
                }
                aria-orientation="vertical"
              >
                {mediaKinds.map((kind, index) => {
                  const Icon = mediaIcons[index];
                  return (
                    <button
                      key={kind}
                      role="tab"
                      id={`media-${kind}`}
                      aria-selected={media === kind}
                      aria-controls="format-panel"
                      tabIndex={media === kind ? 0 : -1}
                      onClick={() => pickMedia(kind)}
                      onKeyDown={(event) => {
                        if (
                          !["ArrowUp", "ArrowDown", "Home", "End"].includes(
                            event.key,
                          )
                        )
                          return;
                        event.preventDefault();
                        const next =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? 3
                              : (index + (event.key === "ArrowDown" ? 1 : 3)) %
                                4;
                        pickMedia(mediaKinds[next]);
                        document
                          .getElementById(`media-${mediaKinds[next]}`)
                          ?.focus();
                      }}
                    >
                      <Icon size={23} aria-hidden="true" />
                      {text.media[index]}
                    </button>
                  );
                })}
              </div>
              <div
                id="format-panel"
                role="tabpanel"
                aria-labelledby={`media-${media}`}
                className="format-panel"
              >
                <label className="sr-only" htmlFor="quality-select">
                  {text.quality}
                </label>
                <select
                  id="quality-select"
                  value={selection}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  {formats.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
                <fieldset className="format-options">
                  <legend className="sr-only">{text.quality}</legend>
                  {formats.map((format) => (
                    <label key={format}>
                      <input
                        type="radio"
                        name="quality"
                        value={format}
                        checked={selection === format}
                        onChange={() => setQuality(format)}
                      />
                      <span>{format}</span>
                      <small>{media === "video" ? "MP4" : text.source}</small>
                    </label>
                  ))}
                </fieldset>
                <div className="preview-actions">
                  <button
                    className="button button-primary preview-download"
                    onClick={onDownload}
                  >
                    <DownloadSimple size={21} aria-hidden="true" />
                    {text.download}
                  </button>
                  <button
                    className="icon-button queue-add"
                    aria-label={text.add}
                    disabled={queued}
                    onClick={() => {
                      setQueueItem({ format: selection, media });
                      setMessage("added");
                    }}
                  >
                    {queued ? (
                      <Check size={21} aria-hidden="true" />
                    ) : (
                      <Plus size={21} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : view === "queue" ? (
            <div className="queue-panel">
              <Stack size={34} className="coral" aria-hidden="true" />
              <div>
                <h3>{text.queueEmpty}</h3>
                <p>{text.queueHint}</p>
              </div>
              {queued ? (
                <div className="queue-item">
                  <img
                    src="/images/cinema-hero-768.webp"
                    alt=""
                    width="90"
                    height="60"
                  />
                  <span>
                    <strong>{text.title}</strong>
                    <small>
                      {queueItem?.format} · {text.queued}
                    </small>
                  </span>
                  <button
                    className="icon-button"
                    aria-label={text.remove}
                    onClick={() => setQueueItem(null)}
                  >
                    <Trash size={20} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <button className="text-button" onClick={() => onView("studio")}>
                {text.back}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : view === "advanced" ? (
            <div className="settings-panel">
              <div>
                <SlidersHorizontal
                  size={29}
                  className="coral"
                  aria-hidden="true"
                />
                <h3>{text.advancedTitle}</h3>
                <p>{text.advancedIntro}</p>
              </div>
              <div className="settings-fields">
                <label>
                  {text.engine}
                  <select
                    value={engine}
                    onChange={(event) => setEngine(event.target.value)}
                  >
                    <option>Auto</option>
                    <option>Native</option>
                    <option>aria2c</option>
                  </select>
                </label>
                <label>
                  {text.connections}
                  <select
                    value={connections}
                    onChange={(event) => setConnections(event.target.value)}
                  >
                    <option>4</option>
                    <option>8</option>
                    <option>16</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={withSubtitles}
                    onChange={(event) => setWithSubtitles(event.target.checked)}
                  />
                  {text.subtitles}
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={withThumbnail}
                    onChange={(event) => setWithThumbnail(event.target.checked)}
                  />
                  {text.thumbnail}
                </label>
              </div>
            </div>
          ) : (
            <div className="settings-panel">
              <div>
                <GearSix size={29} className="coral" aria-hidden="true" />
                <h3>{text.settingsTitle}</h3>
                <p>{text.settingsNote}</p>
              </div>
              <div className="settings-fields">
                <label>
                  {text.folder}
                  <input value="Downloads/EveryVideo" readOnly />
                </label>
                <label>
                  {text.language}
                  <select
                    value={locale}
                    onChange={(event) => onLocale(event.target.value as Locale)}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="studio-status">
          <span className="preview-indicator">
            <span />
            {text.preview}
          </span>
          <p role="status">{message ? text[message] : text.notice}</p>
        </div>
      </div>
    </section>
  );
}
