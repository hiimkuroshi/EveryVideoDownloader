"use client";
import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  AnimatePresence,
  m,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ClosedCaptioning,
  Desktop,
  DotsSixVertical,
  FileAudio,
  FileImage,
  FileVideo,
  Folder,
  GithubLogo,
  Link as LinkIcon,
  MonitorPlay,
  MusicNotes,
  Plus,
  SlidersHorizontal,
  Stack,
} from "@phosphor-icons/react";
import { Reveal } from "./components";
import { REPOSITORY } from "./data";
import type { Locale } from "./data";
import type { StudioView } from "./StudioPreview";
import { storyCopy } from "./storyCopy";

const mediaIcons = [MonitorPlay, MusicNotes, ClosedCaptioning, FileImage];
const fileIcons = [FileVideo, FileAudio, ClosedCaptioning];
const ease = [0.22, 1, 0.36, 1] as const;

function tabKeys(
  event: KeyboardEvent,
  index: number,
  count: number,
  select: (index: number) => void,
) {
  const next =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? (index + 1) % count
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? (index - 1 + count) % count
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? count - 1
            : -1;
  if (next < 0) return;
  event.preventDefault();
  select(next);
  const tabs =
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
  tabs?.[next]?.focus();
}

export function PageProgress({ locale }: { locale: Locale }) {
  const { scrollYProgress, scrollY } = useScroll();
  const [showTop, setShowTop] = useState(false);
  const topVisible = useRef(false);
  useMotionValueEvent(scrollY, "change", (position) => {
    const visible = position > 900;
    if (visible !== topVisible.current) {
      topVisible.current = visible;
      setShowTop(visible);
    }
  });
  const reduced = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32 });
  return (
    <>
      <m.div
        className="reading-progress"
        style={{ scaleX: reduced ? scrollYProgress : scaleX }}
        aria-hidden="true"
      />
      <AnimatePresence>
        {showTop && (
          <m.a
            className="back-top"
            href="#khampha"
            aria-label={storyCopy[locale].backTop}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 8 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <ArrowUp size={21} aria-hidden="true" />
          </m.a>
        )}
      </AnimatePresence>
    </>
  );
}

export function HeroArtwork({ locale }: { locale: Locale }) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const reduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.025, 1.13]);
  return (
    <div className="hero-artwork" ref={target}>
      <m.img
        className="hero-image"
        src="/images/cinema-hero.webp"
        srcSet="/images/cinema-hero-768.webp 768w,/images/cinema-hero.webp 1536w"
        sizes="100vw"
        alt={
          locale === "vi"
            ? "Một người lữ hành nhìn ra hồ nước và dãy núi lúc hoàng hôn"
            : locale === "ja"
              ? "夕暮れ時に山あいの湖を見渡すひとりの旅人"
              : "A lone traveller overlooking a mountain lake at sunset"
        }
        width="1536"
        height="1024"
        fetchPriority="high"
        style={reduced ? {} : { y, scale }}
      />
    </div>
  );
}

function PanelTransition({
  children,
  id,
}: {
  children: ReactNode;
  id: number;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={id}
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -8 }}
        transition={{ duration: reduced ? 0 : 0.22, ease }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

export function Workflow({ locale }: { locale: Locale }) {
  const text = storyCopy[locale];
  const [step, setStep] = useState(0);
  const [quality, setQuality] = useState("1080p");
  return (
    <section
      className="workflow section-space container"
      id="cach-dung"
      aria-labelledby="workflow-title"
    >
      <Reveal className="workflow-copy">
        <h2 className="story-title" id="workflow-title">
          {text.workflowTitle}
        </h2>
        <p className="story-intro">{text.workflowIntro}</p>
        <div
          className="workflow-steps"
          role="tablist"
          aria-label={text.stepLabel}
          aria-orientation="vertical"
        >
          {text.workflowSteps.map((item, index) => (
            <button
              key={item.title}
              role="tab"
              id={`workflow-tab-${index}`}
              aria-controls="workflow-panel"
              aria-selected={step === index}
              tabIndex={step === index ? 0 : -1}
              onClick={() => setStep(index)}
              onKeyDown={(event) => tabKeys(event, index, 3, setStep)}
            >
              <span className="workflow-number" aria-hidden="true">
                0{index + 1}
              </span>
              <span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          ))}
        </div>
      </Reveal>
      <Reveal className="workflow-stage-wrap" delay={0.12}>
        <div
          className="workflow-stage"
          id="workflow-panel"
          role="tabpanel"
          aria-labelledby={`workflow-tab-${step}`}
          tabIndex={0}
        >
          <div className="demo-chrome">
            <span>
              <span className="demo-mark" />
              EveryVideo
            </span>
            <span>{text.demoLabel}</span>
          </div>
          <PanelTransition id={step}>
            <div className={`workflow-visual workflow-visual-${step}`}>
              {step === 0 ? (
                <>
                  <div className="link-orbit" aria-hidden="true">
                    <LinkIcon size={36} weight="light" />
                    <span />
                    <span />
                  </div>
                  <span className="demo-label">{text.inputLabel}</span>
                  <div className="example-url">
                    <LinkIcon size={19} aria-hidden="true" />
                    <span>https://example.com/your-story</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </div>
                  <p className="demo-label found-label">{text.sourceFound}</p>
                  <div className="discovery-types">
                    {mediaIcons.map((Icon, index) => (
                      <span key={text.mediaLabels[index]}>
                        <Icon size={24} weight="light" aria-hidden="true" />
                        {text.mediaLabels[index]}
                      </span>
                    ))}
                  </div>
                </>
              ) : step === 1 ? (
                <>
                  <div className="workflow-thumb">
                    <img
                      src="/images/cinema-hero-768.webp"
                      alt=""
                      width="768"
                      height="512"
                      loading="lazy"
                    />
                    <MonitorPlay size={32} weight="light" aria-hidden="true" />
                  </div>
                  <fieldset className="demo-quality">
                    <legend>{text.chooseLabel}</legend>
                    {["1080p", "720p", "480p"].map((q) => (
                      <label key={q} className={quality === q ? "chosen" : ""}>
                        <input
                          type="radio"
                          name="workflow-quality"
                          value={q}
                          checked={quality === q}
                          onChange={() => setQuality(q)}
                        />
                        {q}
                        <span>MP4</span>
                        <Check size={17} aria-hidden="true" />
                      </label>
                    ))}
                  </fieldset>
                </>
              ) : (
                <>
                  <div className="folder-visual" aria-hidden="true">
                    <Folder size={90} weight="duotone" />
                    <span>
                      <Check size={23} weight="bold" />
                    </span>
                  </div>
                  <p className="demo-label">{text.destination}</p>
                  <strong className="destination-name">
                    Downloads / EveryVideo
                  </strong>
                  <ul className="saved-files" aria-label={text.sampleFiles}>
                    {(locale === "vi"
                      ? ["hanh-trinh.mp4", "ban-thu.m4a", "phu-de.vi.srt"]
                      : locale === "ja"
                        ? ["journey.mp4", "recording.m4a", "dialogue.ja.srt"]
                        : ["the-journey.mp4", "the-recording.m4a", "dialogue.en.srt"]
                    ).map((file, index) => {
                      const Icon = fileIcons[index];
                      return (
                        <li key={file}>
                          <Icon size={20} aria-hidden="true" />
                          <span>{file}</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </PanelTransition>
          <div className="demo-caption">
            <span className="demo-step">0{step + 1} / 03</span>
            <span>{text.demoCaptions[step]}</span>
          </div>
        </div>
        <p className="source-caveat">{text.sourceDependent}</p>
      </Reveal>
    </section>
  );
}

function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const x = useMotionValue(50),
    y = useMotionValue(20);
  const reduced = useReducedMotion();
  const background = useMotionTemplate`radial-gradient(500px circle at ${x}% ${y}%, rgba(255,98,85,0.10), transparent 75%)`;
  return (
    <article
      className={`spotlight ${className}`}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - bounds.left) / bounds.width) * 100);
        y.set(((event.clientY - bounds.top) / bounds.height) * 100);
      }}
    >
      <m.div
        className="pointer-light"
        style={{ background: reduced ? "none" : background }}
        aria-hidden="true"
      />
      {children}
    </article>
  );
}

export function ControlShowcase({
  locale,
  onExplore,
}: {
  locale: Locale;
  onExplore: (view: StudioView) => void;
}) {
  const text = storyCopy[locale];
  return (
    <section
      className="controls-section section-space container"
      aria-labelledby="controls-title"
    >
      <Reveal className="story-heading">
        <h2 className="story-title" id="controls-title">
          {text.controlsTitle}
        </h2>
        <p className="story-intro">{text.controlsIntro}</p>
      </Reveal>
      <div className="control-grid">
        <Reveal className="queue-showcase-wrap">
          <Spotlight className="queue-showcase">
            <Stack
              className="showcase-icon"
              size={29}
              weight="light"
              aria-hidden="true"
            />
            <h3>{text.queueTitle}</h3>
            <p>{text.queueText}</p>
            <button className="inline-link" onClick={() => onExplore("queue")}>
              {text.queueAction}
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
            <div className="queue-illustration" aria-label={text.queueExample}>
              <div className="queue-illustration-label">
                <Stack size={16} aria-hidden="true" />
                {text.queueExample}
                <span>03</span>
              </div>
              {text.queueItems.map((name, index) => {
                const Icon = fileIcons[index];
                return (
                  <div
                    className="queue-example-item"
                    key={name}
                    style={{ "--item-index": index } as CSSProperties}
                  >
                    <span className="queue-example-index">0{index + 1}</span>
                    <span className={`queue-art queue-art-${index}`}>
                      <Icon size={23} weight="light" aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{name}</strong>
                      <small>{["MP4", "M4A", "SRT"][index]}</small>
                    </div>
                    <DotsSixVertical
                      className="queue-grip"
                      size={17}
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>
          </Spotlight>
        </Reveal>
        <Reveal className="local-showcase" delay={0.08}>
          <article>
            <div className="local-visual" aria-hidden="true">
              <span className="local-grid" />
              <Desktop size={72} weight="light" />
              <Folder size={29} weight="duotone" />
            </div>
            <h3>{text.localTitle}</h3>
            <p>{text.localText}</p>
            <span className="local-detail">
              <Check size={16} aria-hidden="true" />
              {text.localDetail}
            </span>
          </article>
        </Reveal>
        <Reveal className="advanced-showcase" delay={0.14}>
          <article>
            <SlidersHorizontal
              size={27}
              weight="light"
              className="showcase-icon"
              aria-hidden="true"
            />
            <h3>{text.advancedTitle}</h3>
            <p>{text.advancedText}</p>
            <dl className="advanced-specs">
              {text.advancedLabels.map((label, index) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{text.advancedValues[index]}</dd>
                </div>
              ))}
            </dl>
            <button
              className="inline-link"
              onClick={() => onExplore("advanced")}
            >
              {text.advancedAction}
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

export function Collections({ locale }: { locale: Locale }) {
  const text = storyCopy[locale];
  return (
    <section
      className="collections section-space"
      aria-labelledby="collection-title"
    >
      <div className="container">
        <Reveal className="story-heading">
          <h2 className="story-title" id="collection-title">
            {text.collectionTitle}
          </h2>
          <p className="story-intro">{text.collectionIntro}</p>
        </Reveal>
        <div className="collection-grid">
          {text.collections.map((item, index) => (
            <Reveal
              className={`collection collection-${index}`}
              key={item.label}
              delay={index * 0.09}
            >
              <div className="collection-image">
                <img
                  src={`/images/${item.image === "cinema-audio" ? item.image : `${item.image}-480`}.webp`}
                  alt={item.alt}
                  width="768"
                  height="512"
                  loading="lazy"
                />
                <div className="collection-image-shade" />
              </div>
              <p className="collection-label">{item.label}</p>
              <h3>{item.title}</h3>
              <p className="collection-description">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FormatExplorer({ locale }: { locale: Locale }) {
  const text = storyCopy[locale];
  const [selected, setSelected] = useState(0);
  const item = text.formats[selected];
  const Icon = mediaIcons[selected];
  return (
    <section
      className="formats-section section-space container"
      aria-labelledby="formats-title"
    >
      <Reveal className="story-heading">
        <h2 className="story-title" id="formats-title">
          {text.formatTitle}
        </h2>
        <p className="story-intro">{text.formatIntro}</p>
      </Reveal>
      <Reveal className="format-explorer">
        <div
          className="explorer-tabs"
          role="tablist"
          aria-label={text.formatLabel}
        >
          {text.mediaLabels.map((label, index) => {
            const TabIcon = mediaIcons[index];
            return (
              <button
                role="tab"
                key={label}
                id={`explorer-tab-${index}`}
                aria-controls="explorer-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => tabKeys(event, index, 4, setSelected)}
              >
                <TabIcon size={22} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <div
          id="explorer-panel"
          role="tabpanel"
          aria-labelledby={`explorer-tab-${selected}`}
          tabIndex={0}
        >
          <PanelTransition id={selected}>
            <div className="explorer-content">
              <div
                className={`format-art format-art-${selected}`}
                aria-hidden="true"
              >
                <img
                  src={
                    selected === 1
                      ? "/images/cinema-audio.webp"
                      : "/images/cinema-hero-768.webp"
                  }
                  alt=""
                  width="768"
                  height="512"
                  loading="lazy"
                />
                <div className="format-art-overlay" />
                <span className="format-visual-label">{item.visual}</span>
                <Icon size={42} weight="light" />
              </div>
              <div className="explorer-description">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="format-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="example-file">
                  <Icon size={24} weight="light" aria-hidden="true" />
                  <span>
                    <strong>{item.file}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <Check size={19} aria-hidden="true" />
                </div>
              </div>
            </div>
          </PanelTransition>
        </div>
        <p className="explorer-note">{text.formatNote}</p>
      </Reveal>
    </section>
  );
}

export function FAQ({ locale }: { locale: Locale }) {
  const text = storyCopy[locale];
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();
  return (
    <section
      className="faq-section section-space container"
      id="faq"
      aria-labelledby="faq-title"
    >
      <Reveal className="faq-heading">
        <h2 className="story-title" id="faq-title">
          {text.faqTitle}
        </h2>
        <p className="story-intro">{text.faqIntro}</p>
        <a
          className="inline-link"
          href={`${REPOSITORY}#readme`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.faqMore}
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </Reveal>
      <Reveal className="faq-list" delay={0.1}>
        {text.faq.map((item, index) => (
          <div
            className={`faq-item ${open === index ? "faq-open" : ""}`}
            key={item.q}
          >
            <h3>
              <button
                id={`faq-question-${index}`}
                aria-expanded={open === index}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpen(open === index ? null : index)}
              >
                {item.q}
                <Plus size={22} aria-hidden="true" />
              </button>
            </h3>
            <div
              className="faq-answer"
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              hidden={open !== index}
            >
              {open === index && (
                <m.p
                  initial={reduced ? false : { opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {item.a}
                </m.p>
              )}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function SourceLink({ locale }: { locale: Locale }) {
  return (
    <a
      className="inline-link"
      href={REPOSITORY}
      target="_blank"
      rel="noopener noreferrer"
    >
      <GithubLogo size={20} aria-hidden="true" />
      {storyCopy[locale].sourceLink}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
