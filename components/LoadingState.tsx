"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Membaca PDF...", icon: "doc" },
  { label: "Menemukan bagian penting...", icon: "search" },
  { label: "Menyusun cerita...", icon: "write" },
];

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);
  const [showLongWait, setShowLongWait] = useState(false);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 5000);

    const waitTimer = setTimeout(() => {
      setShowLongWait(true);
    }, 20000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(waitTimer);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-label="Proses sedang berlangsung"
      style={{
        background: "var(--color-primary-50)",
        border: "1.5px solid var(--color-primary-100)",
        borderRadius: 20,
        padding: 24,
        textAlign: "center",
        animation: "fadeInUp 0.25s ease",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <div className="spinner-primary" />
      </div>

      <p
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "var(--color-primary-700)",
          margin: "0 0 4px",
        }}
      >
        Sedang membuat...
      </p>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          margin: "0 0 20px",
        }}
      >
        {showLongWait
          ? "Ceritanya masih disusun. Mohon tetap di halaman ini."
          : "Proses ini mungkin memerlukan beberapa saat."}
      </p>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          textAlign: "left",
        }}
      >
        {STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: i > stepIndex ? 0.4 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Step indicator */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "var(--color-accent-500)"
                    : isCurrent
                    ? "var(--color-primary-600)"
                    : "var(--color-border)",
                  transition: "background 0.3s",
                }}
              >
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isCurrent ? (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "white",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--color-border)",
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone
                    ? "var(--color-accent-500)"
                    : isCurrent
                    ? "var(--color-primary-700)"
                    : "var(--color-text-secondary)",
                }}
              >
                {step.label}
                {isCurrent && (
                  <span style={{ color: "var(--color-text-tertiary)", marginLeft: 4 }}>
                    Sedang berlangsung
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
