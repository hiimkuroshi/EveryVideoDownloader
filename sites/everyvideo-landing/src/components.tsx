"use client";
import type { ReactNode, RefObject } from "react";
import { m, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  WindowsLogo,
  Package,
  GithubLogo,
  X,
  Play,
  DownloadSimple,
  Link as LinkIcon,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { DOWNLOADS, RELEASE, REPOSITORY, pageCopy } from "./data";
import type { Locale } from "./data";

export function Brand() {
  return (
    <a className="brand" href="#khampha" aria-label="EveryVideo">
      <Play weight="regular" size={35} aria-hidden="true" />
      <span>EveryVideo</span>
    </a>
  );
}
export function WindowsButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button className={`button button-primary ${className}`} onClick={onClick}>
      <WindowsLogo size={23} weight="fill" aria-hidden="true" />
      {children}
    </button>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
export function DialogShell({
  dialogRef,
  titleId,
  children,
  closeLabel,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  titleId: string;
  children: ReactNode;
  closeLabel: string;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last &&
          first
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="dialog-inner">
        <button
          className="icon-button dialog-close"
          aria-label={closeLabel}
          onClick={() => dialogRef.current?.close()}
        >
          <X size={22} aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
export function DownloadDialog({
  dialogRef,
  locale,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  locale: Locale;
}) {
  const text = pageCopy[locale];
  return (
    <DialogShell
      dialogRef={dialogRef}
      titleId="download-title"
      closeLabel={text.close}
    >
      <div className="dialog-copy">
        <WindowsLogo size={35} weight="light" aria-hidden="true" />
        <h2 id="download-title">{text.downloadTitle}</h2>
        <p>{text.downloadIntro}</p>
        <a className="download-option" href={DOWNLOADS.setup}>
          <WindowsLogo size={28} weight="light" aria-hidden="true" />
          <span>
            <strong>{text.installer}</strong>
            <small>{text.installerText}</small>
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
        <a className="download-option" href={DOWNLOADS.portable}>
          <Package size={28} weight="light" aria-hidden="true" />
          <span>
            <strong>{text.portable}</strong>
            <small>{text.portableText}</small>
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
        <p className="release-version">v1.2.0 · Windows x64</p>
        <p className="fine-print">{text.downloadNote}</p>
        <div className="download-resources">
          <a href={RELEASE} target="_blank" rel="noopener noreferrer">
            {text.release}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={DOWNLOADS.checksums}>
            {text.checksum}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <a
          className="source-link"
          href={REPOSITORY}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubLogo size={18} aria-hidden="true" />
          {text.source}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </DialogShell>
  );
}
export function HelpDialog({
  dialogRef,
  locale,
  onDownload,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  locale: Locale;
  onDownload: () => void;
}) {
  const text = pageCopy[locale];
  const icons = [LinkIcon, SlidersHorizontal, DownloadSimple];
  return (
    <DialogShell
      dialogRef={dialogRef}
      titleId="help-title"
      closeLabel={text.close}
    >
      <div className="dialog-copy">
        <Play size={32} className="coral" aria-hidden="true" />
        <h2 id="help-title">{text.helpTitle}</h2>
        <p>{text.helpIntro}</p>
        <ol className="help-steps">
          {text.steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <li key={step.title}>
                <span className="step-icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <WindowsButton
          onClick={() => {
            dialogRef.current?.close();
            onDownload();
          }}
        >
          {text.download}
        </WindowsButton>
        <p className="fine-print">{text.helpNote}</p>
      </div>
    </DialogShell>
  );
}
