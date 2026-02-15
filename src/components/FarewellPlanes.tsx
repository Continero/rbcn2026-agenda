"use client";

import { useEffect, useRef } from "react";

// Destinations spread across upper half of screen (no downward — text is below)
// Angles: 0=right, 90=down, 180=left, 270=up. We use ~150–360 and 0–30 only.
const DESTINATIONS = [
  // USA
  { city: "Minnesota", angle: 300 },
  // Upper-left (Nordic, UK, Ireland)
  { city: "Oslo", angle: 265 },
  { city: "Stockholm", angle: 245 },
  { city: "Copenhagen", angle: 235 },
  { city: "Dublin", angle: 210 },
  { city: "London", angle: 200 },
  // Left (Western Europe)
  { city: "Amsterdam", angle: 195 },
  { city: "Paris", angle: 190 },
  { city: "Brussels", angle: 185 },
  { city: "Madrid", angle: 180 },
  { city: "Lisbon", angle: 175 },
  { city: "Barcelona", angle: 170 },
  // Lower-left (Southern Europe) — only slightly down
  { city: "Zurich", angle: 165 },
  { city: "Rome", angle: 160 },
  { city: "Berlin", angle: 220 },
  { city: "Prague", angle: 215 },
  { city: "Vienna", angle: 155 },
  { city: "Athens", angle: 150 },
  // Right side (East — India, Eastern Europe, Tallinn)
  { city: "Warsaw", angle: 25 },
  { city: "Budapest", angle: 20 },
  { city: "Bucharest", angle: 15 },
  { city: "Tallinn", angle: 350 },
  { city: "Mumbai", angle: 10 },
  { city: "Bangalore", angle: 5 },
  { city: "Delhi", angle: 0 },
  // Straight up (Finland)
  { city: "Rovaniemi", angle: 280 },
  { city: "Oulu", angle: 275 },
];

const PLANE_SPEED = 1.2;
const SPAWN_INTERVAL_MS = 2000;
const MAX_PLANES = 8;

interface Plane {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
}

export function FarewellPlanes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const cx = w / 2;
    const cy = h * 0.35; // roughly where the avatar is
    const planes: Plane[] = [];
    let animId: number;
    let nextSpawn = Date.now() + 500; // first plane quickly
    let destIdx = Math.floor(Math.random() * DESTINATIONS.length);

    function spawnPlane() {
      const dest = DESTINATIONS[destIdx % DESTINATIONS.length];
      destIdx++;

      // Convert angle to radians (CSS/screen: 0=right, clockwise)
      const rad = (dest.angle * Math.PI) / 180;
      const vx = Math.cos(rad) * PLANE_SPEED;
      const vy = Math.sin(rad) * PLANE_SPEED;

      // Plane rotation for visual (point in direction of travel)
      const visualAngle = dest.angle;

      const el = document.createElement("div");
      el.style.cssText = `position:absolute;pointer-events:none;z-index:12;white-space:nowrap;`;

      // SVG plane — the path points UP, so add 90° to make 0° = right
      const rotation = visualAngle + 90;
      const planeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="rgba(230,248,246,0.7)" style="display:block;transform:rotate(${rotation}deg);">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>`;

      // Position label trailing behind the plane (opposite direction of travel)
      el.innerHTML = `<div style="display:inline-flex;align-items:center;gap:6px;flex-direction:row;">
        ${planeSvg}
        <span style="font-size:9px;color:rgba(230,248,246,0.5);font-family:var(--font-mono);white-space:nowrap;">${dest.city}</span>
      </div>`;

      container.appendChild(el);

      // Start slightly offset from center so they don't all originate from same pixel
      const offsetR = 80 + Math.random() * 20;
      const startX = cx + Math.cos(rad) * offsetR;
      const startY = cy + Math.sin(rad) * offsetR;

      planes.push({
        el,
        x: startX,
        y: startY,
        vx,
        vy,
        angle: visualAngle,
      });
    }

    function animate() {
      const now = Date.now();

      // Spawn new planes
      if (now >= nextSpawn && planes.length < MAX_PLANES) {
        spawnPlane();
        nextSpawn = now + SPAWN_INTERVAL_MS + Math.random() * 1000;
      }

      // Move planes
      for (let i = planes.length - 1; i >= 0; i--) {
        const p = planes[i];
        p.x += p.vx;
        p.y += p.vy;
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;

        // Fade out as they approach edges
        const edgeDist = Math.min(p.x, p.y, w - p.x, h - p.y);
        const opacity = Math.min(1, edgeDist / 100);
        p.el.style.opacity = `${Math.max(0, opacity)}`;

        // Remove when off screen
        if (p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 100) {
          p.el.remove();
          planes.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      planes.forEach((p) => p.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-11"
      style={{ overflow: "hidden" }}
    />
  );
}
