"use client";

import { useEffect, useRef, useMemo } from "react";

interface DiscoEffectProps {
  /** 0 = off, 1 = full party mode */
  intensity: number;
  children: React.ReactNode;
}

const DISCO_COLORS = [
  "#ff1493", // hot pink
  "#00ff87", // green
  "#ffdd00", // yellow
  "#ff6b35", // orange
  "#00d4ff", // cyan
  "#bf5fff", // purple
  "#ff4444", // red
  "#44ff44", // lime
];

/**
 * Wraps content with progressive disco effects via inline styles.
 * intensity 0.0–0.15: nothing (golden shimmer stays)
 * intensity 0.15–0.4: subtle color-cycling border
 * intensity 0.4–0.7: stronger glow + pulsing
 * intensity 0.7–1.0: full disco + fireworks
 */
export function DiscoEffect({ intensity, children }: DiscoEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fireworkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colorIndexRef = useRef(0);
  const borderAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation speed in ms per color step — faster at higher intensity
  const stepMs = useMemo(() => Math.max(200, 800 - intensity * 600), [intensity]);

  // Color-cycling border + glow via JS interval (avoids CSS specificity issues)
  useEffect(() => {
    if (intensity <= 0.15 || !containerRef.current) {
      if (borderAnimRef.current) {
        clearInterval(borderAnimRef.current);
        borderAnimRef.current = null;
      }
      return;
    }

    function tick() {
      const el = containerRef.current;
      if (!el) return;
      colorIndexRef.current = (colorIndexRef.current + 1) % DISCO_COLORS.length;
      const color = DISCO_COLORS[colorIndexRef.current];

      // Border
      const borderAlpha = Math.min(0.8, 0.3 + intensity * 0.5);
      el.style.borderColor = hexToRgba(color, borderAlpha);

      // Glow (intensity > 0.4)
      if (intensity > 0.4) {
        const glowSize = Math.round(8 + (intensity - 0.4) * 30);
        const glowAlpha = Math.min(0.5, (intensity - 0.4) * 0.8);
        el.style.boxShadow = `0 0 ${glowSize}px ${hexToRgba(color, glowAlpha)}, inset 0 0 ${Math.round(glowSize / 2)}px ${hexToRgba(color, glowAlpha * 0.3)}`;
      }

      // Background tint (intensity > 0.7)
      if (intensity > 0.7) {
        const bgAlpha = Math.min(0.1, (intensity - 0.7) * 0.3);
        el.style.backgroundColor = hexToRgba(color, bgAlpha);
      }
    }

    tick(); // immediate
    borderAnimRef.current = setInterval(tick, stepMs);

    return () => {
      if (borderAnimRef.current) {
        clearInterval(borderAnimRef.current);
        borderAnimRef.current = null;
      }
    };
  }, [intensity, stepMs]);

  // Fireworks at high intensity
  useEffect(() => {
    if (intensity < 0.7 || !containerRef.current) {
      if (fireworkTimerRef.current) {
        clearInterval(fireworkTimerRef.current);
        fireworkTimerRef.current = null;
      }
      return;
    }

    // Firework frequency: every 3s at 0.7, every 1s at 1.0
    const interval = 3000 - (intensity - 0.7) * (2000 / 0.3);

    function spawnFirework() {
      const container = containerRef.current;
      if (!container) return;

      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const x = 20 + Math.random() * (w - 40);
      const y = 10 + Math.random() * Math.max(10, h - 30);
      const color = DISCO_COLORS[Math.floor(Math.random() * DISCO_COLORS.length)];
      const particleCount = 8 + Math.floor(intensity * 8);

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "firework-particle";
        const angle = (i / particleCount) * 360;
        const distance = 30 + Math.random() * 40;
        particle.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          background: ${color};
          box-shadow: 0 0 3px ${color};
          --fw-dx: ${Math.cos((angle * Math.PI) / 180) * distance}px;
          --fw-dy: ${Math.sin((angle * Math.PI) / 180) * distance}px;
        `;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
      }
    }

    spawnFirework();
    fireworkTimerRef.current = setInterval(spawnFirework, interval);

    return () => {
      if (fireworkTimerRef.current) {
        clearInterval(fireworkTimerRef.current);
        fireworkTimerRef.current = null;
      }
    };
  }, [intensity]);

  if (intensity <= 0.05) {
    return <>{children}</>;
  }

  const borderWidth = intensity > 0.4 ? 3 : 2;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        borderRadius: "12px",
        border: `${borderWidth}px solid transparent`,
        padding: "4px",
        transition: "border-color 0.3s, box-shadow 0.3s, background-color 0.3s",
      }}
    >
      {children}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
