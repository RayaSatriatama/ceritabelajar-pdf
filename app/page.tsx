"use client";

import { useCallback, useRef, useState } from "react";
import PdfUploader from "@/components/PdfUploader";
import LengthSelector from "@/components/LengthSelector";
import LoadingState from "@/components/LoadingState";
import StoryResult from "@/components/StoryResult";
import type { AppState, FileInfo, StoryLength, StoryResponse } from "@/types/story";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("empty");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [focus, setFocus] = useState("");
  const [length, setLength] = useState<StoryLength>("short");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryResponse | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const focusCharCount = focus.length;
  const showCharCount = focusCharCount > 120;

  const isLoading = appState === "loading";
  const canSubmit = appState === "file_selected" || appState === "processing_error";

  // ---- File handling ----
  const handleFileSelect = useCallback((info: FileInfo) => {
    // Client-side validation
    if (info.file.name === "_invalid_") {
      setUploadError("Pilih file dengan format PDF.");
      setAppState("upload_error");
      setFileInfo(info);
      return;
    }
    if (info.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran PDF melebihi 10 MB. Gunakan file yang lebih kecil.");
      setAppState("upload_error");
      setFileInfo(info);
      return;
    }
    setUploadError(null);
    setProcessingError(null);
    setFileInfo(info);
    setAppState("file_selected");
  }, []);

  const handleFileRemove = useCallback(() => {
    setFileInfo(null);
    setUploadError(null);
    setProcessingError(null);
    setAppState("empty");
  }, []);

  // ---- Submit ----
  const handleSubmit = useCallback(async () => {
    if (!fileInfo || isLoading) return;

    setAppState("loading");
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileInfo.file, fileInfo.name);
      formData.append("focus", focus.trim());
      formData.append("length", length);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Terjadi kesalahan. Coba lagi beberapa saat.");
      }

      setResult(data as StoryResponse);
      setAppState("success");

      // Scroll and focus the result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        const titleEl = document.getElementById("story-title");
        titleEl?.focus();
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
      setProcessingError(msg);
      setAppState("processing_error");
    }
  }, [fileInfo, focus, isLoading, length]);

  // ---- Regenerate ----
  const handleRegenerate = useCallback(async () => {
    if (!fileInfo || isRegenerating) return;

    setIsRegenerating(true);
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileInfo.file, fileInfo.name);
      formData.append("focus", focus.trim());
      formData.append("length", length);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Terjadi kesalahan. Coba lagi beberapa saat.");
      }

      setResult(data as StoryResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setProcessingError(msg);
    } finally {
      setIsRegenerating(false);
    }
  }, [fileInfo, focus, isRegenerating, length]);

  // ---- Reset ----
  const handleReset = useCallback(() => {
    setAppState("empty");
    setFileInfo(null);
    setFocus("");
    setLength("short");
    setUploadError(null);
    setProcessingError(null);
    setResult(null);
    setIsRegenerating(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border-light)",
          background: "rgba(248, 250, 252, 0.95)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="container" style={{ padding: "0 16px" }}>
          <button
            onClick={handleReset}
            aria-label="Kembali ke halaman awal CeritaBelajar PDF"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 10,
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-border-light)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            {/* Book icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              CeritaBelajar PDF
            </span>
          </button>
        </div>
      </header>

      <main>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
          {/* Hero */}
          <section
            aria-labelledby="hero-title"
            style={{ marginBottom: 32, textAlign: "center" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-primary-50)",
                border: "1px solid var(--color-primary-100)",
                borderRadius: 999,
                padding: "5px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--color-primary-600)",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary-600)" }}>
                Satu agen AI
              </span>
            </div>

            <h1
              id="hero-title"
              className="text-display"
              style={{ marginBottom: 12, padding: "0 8px" }}
            >
              Ubah PDF menjadi cerita<br />
              yang lebih mudah dipahami
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Unggah materi, pilih panjang cerita, lalu mulai membaca.
            </p>
          </section>

          {/* Form card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* PDF Uploader */}
              <section aria-label="Unggah PDF">
                <PdfUploader
                  fileInfo={fileInfo}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  error={uploadError}
                  disabled={isLoading}
                />
              </section>

              {/* Focus input */}
              <section aria-label="Fokus cerita">
                <label
                  htmlFor="focus-input"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  Fokus cerita
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      marginLeft: 6,
                    }}
                  >
                    (opsional)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="focus-input"
                    type="text"
                    className="input-field"
                    placeholder="Contoh: proses terjadinya hujan"
                    maxLength={150}
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    disabled={isLoading}
                    aria-describedby="focus-help"
                  />
                  {showCharCount && (
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        color:
                          focusCharCount >= 150
                            ? "var(--color-error)"
                            : "var(--color-text-tertiary)",
                      }}
                    >
                      {focusCharCount}/150
                    </span>
                  )}
                </div>
                <p
                  id="focus-help"
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-tertiary)",
                    marginTop: 4,
                  }}
                >
                  Tulis bagian yang paling ingin kamu pahami.
                </p>
              </section>

              {/* Length selector */}
              <section aria-label="Pilih panjang cerita">
                <LengthSelector
                  value={length}
                  onChange={setLength}
                  disabled={isLoading}
                />
              </section>

              {/* Submit button */}
              <button
                id="btn-buat-cerita"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                aria-busy={isLoading}
                aria-label="Buat cerita dari PDF yang diunggah"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    Sedang membuat...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Buat Cerita
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && <LoadingState />}

          {/* Processing error */}
          {appState === "processing_error" && processingError && (
            <div
              role="alert"
              className="animate-fade-in-up"
              style={{
                padding: "16px 20px",
                background: "var(--color-error-bg)",
                border: "1px solid var(--color-error-border)",
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-error)"
                  strokeWidth="2.5"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--color-error)",
                      margin: "0 0 4px",
                    }}
                  >
                    Cerita belum berhasil dibuat
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-error)", margin: 0 }}>
                    {processingError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Story result */}
          {appState === "success" && result && (
            <div ref={resultRef}>
              <StoryResult
                result={result}
                onRegenerate={handleRegenerate}
                onReset={handleReset}
                isRegenerating={isRegenerating}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border-light)",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
          }}
        >
          CeritaBelajar PDF - Prototipe fungsional berbasis AI.
          Selalu rujuk PDF asli sebagai sumber utama belajar.
        </p>
      </footer>
    </div>
  );
}
