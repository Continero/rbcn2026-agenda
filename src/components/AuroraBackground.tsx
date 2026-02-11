"use client";

import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  animation: string;
  delay: number;
  baseOpacity: number;
}

function generateStars(count: number, seed: number): Star[] {
  // Simple seeded pseudo-random for consistent star placement
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };

  const animations = ["twinkle-slow", "twinkle-mid", "twinkle-fast"];
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    const r = rand();
    // Distribution: ~60% small, ~25% medium, ~15% large
    const size = r < 0.6 ? 1 : r < 0.85 ? 1.5 : 2;
    const baseOpacity = size === 1 ? 0.3 + rand() * 0.3 : size === 1.5 ? 0.4 + rand() * 0.3 : 0.5 + rand() * 0.4;

    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      size,
      animation: animations[Math.floor(rand() * animations.length)],
      delay: rand() * 10,
      baseOpacity,
    });
  }

  return stars;
}

interface AuroraBackgroundProps {
  pulse?: boolean;
}

export function AuroraBackground({ pulse }: AuroraBackgroundProps) {
  const stars = useMemo(() => generateStars(70, 42), []);

  return (
    <div className={`aurora-bg ${pulse ? "aurora-pulse-active" : ""}`}>
      {/* Aurora gradient layers */}
      <div className="aurora-layer aurora-layer-1" />
      <div className="aurora-layer aurora-layer-2" />
      <div className="aurora-layer aurora-layer-3" />

      {/* Twinkling stars */}
      {stars.map((star, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: star.size >= 2 ? "#ffffff" : "rgb(230, 248, 246)",
            opacity: star.baseOpacity,
            animation: `${star.animation} ${star.animation === "twinkle-slow" ? "8s" : star.animation === "twinkle-mid" ? "5s" : "3s"} ease-in-out ${star.delay}s infinite`,
            willChange: "opacity",
          }}
        />
      ))}
    </div>
  );
}
