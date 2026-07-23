"use client";

import type { StoryLength } from "@/types/story";

interface LengthSelectorProps {
  value: StoryLength;
  onChange: (v: StoryLength) => void;
  disabled?: boolean;
}

const options: { value: StoryLength; label: string; desc: string; detail: string }[] = [
  {
    value: "short",
    label: "Singkat",
    desc: "2-3 menit membaca",
    detail: "250-350 kata",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "4-5 menit membaca",
    detail: "400-600 kata",
  },
];

export default function LengthSelector({
  value,
  onChange,
  disabled = false,
}: LengthSelectorProps) {
  return (
    <div>
      <p
        id="length-label"
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: 10,
        }}
      >
        Panjang cerita
      </p>
      <div
        role="radiogroup"
        aria-labelledby="length-label"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={isActive}
              onClick={() => !disabled && onChange(opt.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  onChange(value === "short" ? "medium" : "short");
                }
              }}
              tabIndex={disabled ? -1 : 0}
              style={{
                padding: "14px 12px",
                borderRadius: 14,
                border: isActive
                  ? "2px solid var(--color-primary-600)"
                  : "2px solid var(--color-border)",
                background: isActive ? "var(--color-primary-50)" : "var(--color-surface)",
                cursor: disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                opacity: disabled ? 0.6 : 1,
                transition: "border-color 0.15s, background 0.15s",
                position: "relative",
                fontFamily: "inherit",
              }}
            >
              {/* Checkmark */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--color-primary-600)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}

              {/* Clock icon + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isActive ? "var(--color-primary-600)" : "var(--color-text-secondary)"}
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isActive
                      ? "var(--color-primary-600)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {opt.label}
                </span>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: isActive
                    ? "var(--color-primary-600)"
                    : "var(--color-text-secondary)",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {opt.desc}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  margin: "2px 0 0",
                }}
              >
                {opt.detail}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
