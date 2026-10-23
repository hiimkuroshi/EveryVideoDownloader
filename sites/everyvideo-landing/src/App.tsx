import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import {
  Play,
  List,
  X,
  Sun,
  Moon,
  Globe,
  YoutubeLogo,
  TiktokLogo,
  FacebookLogo,
  InstagramLogo,
  XLogo,
  CaretDown,
} from "@phosphor-icons/react";
import {
  Brand,
  DialogShell,
  DownloadDialog,
  HelpDialog,
  Reveal,
  WindowsButton,
} from "./components";
import StudioPreview from "./StudioPreview";
import type { StudioView } from "./StudioPreview";
import { pageCopy } from "./data";
import type { Locale } from "./data";
import { REPOSITORY } from "./data";
import { storyCopy } from "./storyCopy";
import {
  Collections,
  ControlShowcase,
  FAQ,
  FormatExplorer,
  HeroArtwork,
  PageProgress,
  SourceLink,
  Workflow,
} from "./LandingStory";

const waveform = [
  12, 24, 18, 35, 25, 43, 62, 38, 26, 50, 76, 46, 31, 58, 92, 66, 40, 72, 49,
  30, 58, 84, 54, 36, 63, 44, 27, 47, 70, 41, 24, 53, 35, 18, 32, 24, 14, 20,
];
function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "vi";
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get("lang") || params.get("hl");
  if (langParam === "ja" || langParam === "en" || langParam === "vi") {
    return langParam;
  }
  const saved = localStorage.getItem("everyvideo-locale");
  if (saved === "ja" || saved === "en" || saved === "vi") {
    return saved;
  }
  return "vi";
}

function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [light, setLight] = useState(false);
  const [view, setView] = useState<StudioView>("studio");
  const [scrolled, setScrolled] = useState(false);
  const headerSentinel = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDialogElement>(null),
    helpRef = useRef<HTMLDialogElement>(null),
    menuRef = useRef<HTMLDialogElement>(null);
  const text = pageCopy[locale],
    reduced = useReducedMotion();
  const story = storyCopy[locale];

  function handleLocale(next: Locale) {
    setLocale(next);
    try {
      localStorage.setItem("everyvideo-locale", next);
      const url = new URL(window.location.href);
      if (next === "vi") {
        url.searchParams.delete("lang");
        url.searchParams.delete("hl");
      } else {
        url.searchParams.set("lang", next);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    if (headerSentinel.current) observer.observe(headerSentinel.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "vi"
        ? "EveryVideo — Giữ lại những điều đáng xem"
        : locale === "ja"
          ? "EveryVideo — 手元に残す、心動かす瞬間を"
          : "EveryVideo — Keep the things worth watching";
  }, [locale]);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
  }, [light]);
  function download() {
    downloadRef.current?.showModal();
  }
  function help() {
    helpRef.current?.showModal();
  }
  function settings() {
    exploreStudio("settings");
  }
  function exploreStudio(next: StudioView) {
    setView(next);
    document
      .getElementById("studio")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    document.getElementById(`view-${next}`)?.focus({ preventScroll: true });
  }
  return (
    <>
      <PageProgress locale={locale} />
      <div
        ref={headerSentinel}
        className="header-sentinel"
        aria-hidden="true"
      />
      <a className="skip-link" href="#main">
        {text.skip}
      </a>
      <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="header-inner">
          <Brand />
          <nav
            className="desktop-nav"
            aria-label={
              locale === "vi"
                ? "Điều hướng chính"
                : locale === "ja"
                  ? "メインナビゲーション"
                  : "Main navigation"
            }
          >
            <a href="#khampha">{text.explore}</a>
            <a href="#tinhnang">{text.features}</a>
            <button onClick={help}>{text.guide}</button>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-controls">
            <button
              className="icon-button theme-toggle"
              onClick={() => setLight(!light)}
              aria-label={text.theme}
              aria-pressed={light}
            >
              {light ? (
                <Moon size={21} aria-hidden="true" />
              ) : (
                <Sun size={22} aria-hidden="true" />
              )}
            </button>
            <label className="language-control">
              <Globe size={20} aria-hidden="true" />
              <span className="sr-only">{text.language}</span>
              <select
                value={locale}
                onChange={(event) => handleLocale(event.target.value as Locale)}
                aria-label={text.language}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
              <CaretDown size={12} aria-hidden="true" />
            </label>
          </div>
          <WindowsButton onClick={download} className="header-download">
            {text.download}
          </WindowsButton>
          <button
            className="icon-button mobile-toggle"
            aria-label={text.menu}
            aria-haspopup="dialog"
            onClick={() => menuRef.current?.showModal()}
          >
            <List size={27} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main id="main">
        <section id="khampha" className="hero" aria-labelledby="hero-title">
          <HeroArtwork locale={locale} />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <m.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 id="hero-title">
                {text.headline.map((line, index) => (
                  <m.span
                    key={`${locale}-${line}`}
                    initial={reduced ? false : { opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.12 + index * 0.13,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {line}
                    {index === 2 ? <b className="coral">.</b> : null}
                  </m.span>
                ))}
              </h1>
              <p>{text.description}</p>
              <div className="hero-actions">
                <WindowsButton onClick={download}>
                  {text.download}
                </WindowsButton>
                <button className="button button-outline" onClick={help}>
                  <Play size={20} weight="fill" aria-hidden="true" />
                  {text.watch}
                </button>
              </div>
              <small className="availability">{text.availability}</small>
            </m.div>
          </div>
        </section>
        <div className="container studio-container">
          <Reveal>
            <StudioPreview
              locale={locale}
              view={view}
              onView={setView}
              onDownload={download}
              onLocale={handleLocale}
            />
          </Reveal>
          <div className="studio-context">
            <p>{story.studioCaption}</p>
            <span>{story.studioNote}</span>
          </div>
        </div>
        <Workflow locale={locale} />
        <section
          id="tinhnang"
          className="features container"
          aria-labelledby="features-title"
        >
          <Reveal className="section-heading">
            <p>{text.featureEyebrow}</p>
            <h2 id="features-title">
              {text.featureTitle}
              <span className="coral">.</span>
            </h2>
          </Reveal>
          <div className="feature-grid">
            {text.featureItems.map((feature, index) => (
              <Reveal
                key={feature.title}
                className="feature"
                delay={index * 0.08}
              >
                <div className={`feature-image feature-image-${index}`}>
                  <img
                    src={
                      index === 1
                        ? "/images/cinema-audio.webp"
                        : "/images/cinema-hero-768.webp"
                    }
                    alt={
                      index === 1
                        ? locale === "vi"
                          ? "Tai nghe phòng thu màu đen trên mặt gỗ, ánh sáng ấm"
                          : locale === "ja"
                            ? "温かな光に包まれた木目上のスタジオヘッドホン"
                            : "Black studio headphones on wood in warm light"
                        : locale === "vi"
                          ? "Hồ nước và núi non, hình minh họa nội dung"
                          : locale === "ja"
                            ? "山々と湖、コンテンツのイメージ画像"
                            : "A mountain lake, illustrative media artwork"
                    }
                    width="768"
                    height="512"
                    loading="lazy"
                  />
                  {index === 1 ? (
                    <div className="waveform" aria-hidden="true">
                      {waveform.map((height, i) => (
                        <span key={i} style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  ) : index === 2 ? (
                    <div
                      className="subtitle-example"
                      aria-label={
                        locale === "vi"
                          ? "Ví dụ phụ đề"
                          : locale === "ja"
                            ? "字幕サンプル"
                            : "Subtitle example"
                      }
                    >
                      {text.subtitleSample}
                    </div>
                  ) : null}
                </div>
                <h3>{feature.title}</h3>
                <p className="feature-subtitle">{feature.subtitle}</p>
                <p className="feature-description">{feature.description}</p>
                <span className="feature-format">
                  {["MP4 / MKV", "MP3 / M4A", "SRT / VTT"][index]}
                </span>
              </Reveal>
            ))}
          </div>
        </section>
        <section
          className="platform-strip"
          aria-label={
            locale === "vi"
              ? "Một số nền tảng được hỗ trợ"
              : locale === "ja"
                ? "対応プラットフォームの一例"
                : "Selected supported platforms"
          }
        >
          <div className="container platform-inner">
            <div className="platforms">
              <span>
                <YoutubeLogo
                  size={30}
                  weight="fill"
                  className="youtube"
                  aria-hidden="true"
                />
                YouTube
              </span>
              <span>
                <img src="/icons/bilibili.svg" alt="" width="29" height="29" />
                Bilibili
              </span>
              <span>
                <TiktokLogo size={28} className="tiktok" aria-hidden="true" />
                TikTok
              </span>
              <span>
                <FacebookLogo
                  size={29}
                  weight="fill"
                  className="facebook"
                  aria-hidden="true"
                />
                Facebook
              </span>
              <span>
                <InstagramLogo
                  size={28}
                  className="instagram"
                  aria-hidden="true"
                />
                Instagram
              </span>
              <span>
                <XLogo size={25} aria-hidden="true" />X
              </span>
            </div>
            <p>{text.platformNote}</p>
          </div>
        </section>
        <ControlShowcase locale={locale} onExplore={exploreStudio} />
        <Collections locale={locale} />
        <FormatExplorer locale={locale} />
        <FAQ locale={locale} />
        <section className="final-cta" aria-labelledby="cta-title">
          <img
            src="/images/cinema-hero.webp"
            alt=""
            width="1536"
            height="1024"
            loading="lazy"
          />
          <div className="cta-overlay" />
          <div className="container cta-content">
            <Reveal className="cta-story">
              <p className="cta-eyebrow">{story.finalEyebrow}</p>
              <h2 id="cta-title">
                {text.finalTitle}
                <span className="coral">.</span>
              </h2>
              <p className="cta-description">{story.finalDescription}</p>
              <div className="cta-actions">
                <WindowsButton onClick={download}>
                  {text.download}
                </WindowsButton>
                <SourceLink locale={locale} />
              </div>
              <p className="cta-detail">{story.finalDetail}</p>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-story">
          <p>{story.footerTagline}</p>
          <div>
            <a href="#faq">{story.footerHelp}</a>
            <a
              href={`${REPOSITORY}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {story.footerIssue}
            </a>
          </div>
        </div>
        <div className="container footer-inner">
          <Brand />
          <p>{text.local}</p>
          <nav
            aria-label={
              locale === "vi"
                ? "Điều hướng cuối trang"
                : locale === "ja"
                  ? "フッターナビゲーション"
                  : "Footer navigation"
            }
          >
            <a href="#khampha">{text.explore}</a>
            <a href="#tinhnang">{text.features}</a>
            <button onClick={help}>{text.guide}</button>
            <button onClick={settings}>{text.settings}</button>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} EveryVideo</span>
          <span>{story.footerRights}</span>
        </div>
      </footer>
      <DownloadDialog dialogRef={downloadRef} locale={locale} />
      <HelpDialog dialogRef={helpRef} locale={locale} onDownload={download} />
      <DialogShell
        dialogRef={menuRef}
        titleId="menu-title"
        closeLabel={text.close}
      >
        <div className="mobile-menu">
          <h2 id="menu-title">EveryVideo</h2>
          <nav
            aria-label={
              locale === "vi"
                ? "Điều hướng di động"
                : locale === "ja"
                  ? "モバイルナビゲーション"
                  : "Mobile navigation"
            }
          >
            <a href="#khampha" onClick={() => menuRef.current?.close()}>
              {text.explore}
            </a>
            <a href="#tinhnang" onClick={() => menuRef.current?.close()}>
              {text.features}
            </a>
            <a href="#faq" onClick={() => menuRef.current?.close()}>
              FAQ
            </a>
            <button
              onClick={() => {
                menuRef.current?.close();
                help();
              }}
            >
              {text.guide}
            </button>
          </nav>
          <WindowsButton
            onClick={() => {
              menuRef.current?.close();
              download();
            }}
          >
            {text.download}
          </WindowsButton>
          <button
            className="text-button"
            onClick={() => menuRef.current?.close()}
          >
            <X size={16} aria-hidden="true" />
            {text.close}
          </button>
        </div>
      </DialogShell>
    </>
  );
}
export default App;
