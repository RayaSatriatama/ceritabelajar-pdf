"use client";

import { useCallback, useState } from "react";
import type { StoryResponse } from "@/types/story";

interface StoryResultProps {
  result: StoryResponse;
  onRegenerate: () => void;
  onReset: () => void;
  isRegenerating: boolean;
}

const LENGTH_LABEL: Record<string, string> = {
  short: "Cerita singkat",
  medium: "Cerita medium",
};

const READ_TIME: Record<string, string> = {
  short: "2-3 menit",
  medium: "4-5 menit",
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export default function StoryResult({
  result,
  onRegenerate,
  onReset,
  isRegenerating,
}: StoryResultProps) {
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = `${result.title}\n\n${result.story}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [result]);

  const handleResetClick = () => {
    if (!copied) {
      setShowResetConfirm(true);
    } else {
      onReset();
    }
  };

  const paragraphs = result.story
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = countWords(result.story);

  return (
    <div
      id="story-result"
      className="animate-fade-in-up"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Story card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Card header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-primary-50)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-primary-600)",
              background: "var(--color-primary-100)",
              padding: "4px 10px",
              borderRadius: 999,
              letterSpacing: "0.02em",
            }}
          >
            Cerita dari PDF
          </span>
        </div>

        {/* Story content */}
        <div style={{ padding: "24px" }}>
          {/* Title */}
          <h2
            id="story-title"
            tabIndex={-1}
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--color-text-primary)",
              margin: "0 0 12px",
              outline: "none",
            }}
          >
            {result.title}
          </h2>

          {/* Metadata */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 16px",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <MetaItem icon="file" text={result.sourceFile} />
            <MetaDot />
            <MetaItem icon="tag" text={LENGTH_LABEL[result.length] ?? result.length} />
            <MetaDot />
            <MetaItem icon="clock" text={READ_TIME[result.length] ?? "-"} />
            <MetaDot />
            <MetaItem icon="words" text={`${wordCount} kata`} />
          </div>

          {/* Paragraphs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 640,
            }}
          >
            {paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Source note */}
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid var(--color-border-light)",
            }}
          >
            Cerita ini dibuat hanya dari isi PDF yang kamu unggah. Tetap gunakan PDF asli sebagai
            bahan belajar utama.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Copy */}
        <button
          className="btn-primary"
          onClick={handleCopy}
          aria-label="Salin cerita ke clipboard"
        >
          {copied ? (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Cerita disalin
            </>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Salin Cerita
            </>
          )}
        </button>

        {/* Regenerate */}
        <button
          className="btn-secondary"
          onClick={onRegenerate}
          disabled={isRegenerating}
          aria-label="Buat versi lain dari PDF yang sama"
        >
          {isRegenerating ? (
            <>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid var(--color-primary-200)",
                  borderTopColor: "var(--color-primary-600)",
                  animation: "spin 0.7s linear infinite",
                  flexShrink: 0,
                }}
              />
              Sedang membuat...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Buat Versi Lain
            </>
          )}
        </button>

        {/* Reset */}
        {showResetConfirm ? (
          <div
            style={{
              padding: "14px 16px",
              background: "var(--color-error-bg)",
              border: "1px solid var(--color-error-border)",
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 14, color: "var(--color-error)", margin: "0 0 10px", fontWeight: 500 }}>
              Mulai dari awal? Cerita saat ini akan dihapus dari halaman.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, minHeight: 40, fontSize: 14, background: "var(--color-error)" }}
                onClick={onReset}
              >
                Ya, mulai ulang
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, minHeight: 40, fontSize: 14 }}
                onClick={() => setShowResetConfirm(false)}
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-tertiary"
            style={{ width: "100%" }}
            onClick={handleResetClick}
            aria-label="Mulai lagi dengan PDF baru"
          >
            Mulai Lagi
          </button>
        )}
      </div>

      {/* Toast */}
      {copied && (
        <div className="toast" aria-live="polite">
          Cerita berhasil disalin
        </div>
      )}
    </div>
  );
}

function MetaItem({ icon, text }: { icon: string; text: string }) {
  const icons: Record<string, React.ReactNode> = {
    file: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    tag: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    clock: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    words: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="18" y2="18" />
      </svg>
    ),
  };

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "var(--color-text-secondary)",
      }}
    >
      {icons[icon]}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 180,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function MetaDot() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "var(--color-border)",
        flexShrink: 0,
      }}
    />
  );
}
