"use client";

import { useRef, useState, useCallback } from "react";
import type { FileInfo } from "@/types/story";

interface PdfUploaderProps {
  fileInfo: FileInfo | null;
  onFileSelect: (info: FileInfo) => void;
  onFileRemove: () => void;
  error: string | null;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfUploader({
  fileInfo,
  onFileSelect,
  onFileRemove,
  error,
  disabled = false,
}: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        onFileSelect({ name: file.name, size: file.size, file: new File([], "_invalid_") });
        return;
      }
      onFileSelect({ name: file.name, size: file.size, file });
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  if (fileInfo && !error) {
    return (
      <div
        style={{
          border: "1.5px solid var(--color-border)",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "var(--color-surface)",
        }}
      >
        {/* PDF icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="7" y="18" fontSize="6" fontWeight="700" fill="#dc2626" fontFamily="sans-serif">
              PDF
            </text>
          </svg>
        </div>

        {/* File info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            {fileInfo.name}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              margin: "2px 0 0",
            }}
          >
            {formatFileSize(fileInfo.size)}
          </p>
        </div>

        {/* Remove button */}
        {!disabled && (
          <button
            onClick={onFileRemove}
            aria-label="Hapus file"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "var(--color-bg)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-error-bg)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  const borderColor = error
    ? "var(--color-error)"
    : isDragging
    ? "var(--color-primary-600)"
    : "var(--color-border)";

  const bgColor = error
    ? "var(--color-error-bg)"
    : isDragging
    ? "var(--color-primary-50)"
    : "var(--color-bg)";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        style={{ display: "none" }}
        aria-label="Pilih file PDF"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Area unggah PDF. Klik atau seret file ke sini."
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: 16,
          background: bgColor,
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color 0.15s, background 0.15s",
          opacity: disabled ? 0.6 : 1,
          textAlign: "center",
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: isDragging
              ? "var(--color-primary-100)"
              : "var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, transform 0.15s",
            transform: isDragging ? "scale(1.1)" : "scale(1)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? "var(--color-primary-600)" : "var(--color-text-secondary)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDragging
                ? "var(--color-primary-600)"
                : "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Pilih satu file PDF
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              margin: "4px 0 0",
            }}
          >
            Maksimal 10 MB. Gunakan PDF yang teksnya dapat diseleksi.
          </p>
        </div>

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-primary-600)",
            background: "var(--color-primary-50)",
            padding: "6px 16px",
            borderRadius: 999,
          }}
        >
          Pilih PDF
        </span>
      </div>

      {/* Privacy note */}
      {!error && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          PDF digunakan untuk membuat cerita pada sesi ini dan tidak disimpan sebagai riwayat.
        </p>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginTop: 10,
            padding: "10px 14px",
            background: "var(--color-error-bg)",
            border: "1px solid var(--color-error-border)",
            borderRadius: 10,
          }}
        >
          <svg
            width="16"
            height="16"
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
          <p style={{ fontSize: 13, color: "var(--color-error)", margin: 0 }}>{error}</p>
        </div>
      )}
    </div>
  );
}
