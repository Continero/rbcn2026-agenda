"use client";

import { useEffect, useRef } from "react";
import { schedule, ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";

const CHAR_W = 18;
const CHAR_H = 30;
const SPEED_MIN = 0.3;
const SPEED_MAX = 0.7;
const BUBBLE_MIN_MS = 8000;
const BUBBLE_MAX_MS = 20000;
const BUBBLE_DURATION_MS = 5000;
const BOTTOM_MARGIN = 10;
const MAX_VISIBLE_BUBBLES = 3;
const MAX_STACK_LAYERS = 2;

// --- Character trait pools ---
const HAIR_COLORS = [
  "#2a1f14", "#1a1a1a", "#b8935a", "#a67b4f", "#c4a060",
  "#e8c49a", "#8b4513", "#d4a574", "#555555", "#cc3333",
  "#3a2a1e", "#f5deb3", "#654321", "#4a3728", "#c08040",
];

const SKIN_TONES = [
  "#f0cda8", "#e8c49a", "#d4a574", "#c49060", "#a0764a",
  "#f5deb3", "#e8b88a", "#c68642", "#8d5524", "#f0d5b8",
];

const SHIRT_COLORS = [
  "#e8365d", "#3a8fd4", "#5cb85c", "#f0ad4e", "#9b59b6",
  "#e67e22", "#1abc9c", "#e74c3c", "#3498db", "#2ecc71",
  "#f39c12", "#8e44ad", "#d35400", "#16a085", "#c0392b",
  "#2980b9", "#27ae60", "#7a6532", "#1a1a2e", "#c0392b",
];

const PANTS_COLORS = [
  "#2c2c3a", "#1a1a2e", "#3a2a1e", "#15152a", "#2a3a2a",
  "#2c3e50", "#1c1c1c", "#3b3b5c",
];

const SHOE_COLORS = [
  "#3a2a1e", "#1a1a1a", "#4a2e14", "#2c2c2c", "#5a3a2a",
];

// Simple deterministic hash from string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], hash: number, offset: number = 0): T {
  return arr[((hash >> offset) + offset) % arr.length];
}

function bit(hash: number, n: number): boolean {
  return ((hash >> n) & 1) === 1;
}

interface CharTraits {
  hairColor: string;
  hairStyle: "short" | "medium" | "tall" | "bald" | "spiky";
  skinTone: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  hasGlasses: boolean;
  hasBeard: boolean;
  beardColor: string;
}

function generateTraits(code: string): CharTraits {
  const h = hashCode(code);
  const hairColor = pick(HAIR_COLORS, h, 0);
  const styles: CharTraits["hairStyle"][] = ["short", "medium", "tall", "bald", "spiky"];

  return {
    hairColor,
    hairStyle: styles[h % styles.length],
    skinTone: pick(SKIN_TONES, h, 3),
    shirtColor: pick(SHIRT_COLORS, h, 5),
    pantsColor: pick(PANTS_COLORS, h, 7),
    shoeColor: pick(SHOE_COLORS, h, 9),
    hasGlasses: bit(h, 4),
    hasBeard: bit(h, 6),
    beardColor: hairColor,
  };
}

function createCharacterSvg(traits: CharTraits): string {
  const {
    hairColor, hairStyle, skinTone, shirtColor,
    pantsColor, shoeColor, hasGlasses, hasBeard, beardColor,
  } = traits;

  // Darken helper
  const darken = (hex: string, amt: number) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  };

  const shirtDark = darken(shirtColor, 30);
  const pantsDark = darken(pantsColor, 20);

  // Hair variations (higher detail in 48x80 viewBox)
  let hairSvg = "";
  switch (hairStyle) {
    case "short":
      hairSvg = `<rect x="10" y="3" width="28" height="8" fill="${hairColor}"/>
        <rect x="12" y="1" width="24" height="4" fill="${hairColor}"/>
        <rect x="14" y="0" width="20" height="2" fill="${hairColor}"/>`;
      break;
    case "medium":
      hairSvg = `<rect x="8" y="3" width="32" height="10" fill="${hairColor}"/>
        <rect x="12" y="0" width="24" height="5" fill="${hairColor}"/>
        <rect x="8" y="10" width="5" height="8" fill="${hairColor}"/>
        <rect x="35" y="10" width="5" height="8" fill="${hairColor}"/>`;
      break;
    case "tall":
      hairSvg = `<rect x="12" y="-2" width="24" height="14" fill="${hairColor}"/>
        <rect x="10" y="4" width="28" height="8" fill="${hairColor}"/>
        <rect x="16" y="-5" width="16" height="5" fill="${hairColor}"/>`;
      break;
    case "bald":
      hairSvg = `<rect x="12" y="4" width="24" height="3" fill="${skinTone}"/>`;
      break;
    case "spiky":
      hairSvg = `<rect x="10" y="4" width="28" height="7" fill="${hairColor}"/>
        <rect x="12" y="-1" width="5" height="7" fill="${hairColor}"/>
        <rect x="21" y="-3" width="6" height="9" fill="${hairColor}"/>
        <rect x="31" y="0" width="5" height="6" fill="${hairColor}"/>`;
      break;
  }

  // Glasses
  const glassesSvg = hasGlasses
    ? `<rect x="13" y="15" width="8" height="6" fill="none" stroke="#444" stroke-width="1.2" rx="1"/>
       <rect x="27" y="15" width="8" height="6" fill="none" stroke="#444" stroke-width="1.2" rx="1"/>
       <line x1="21" y1="18" x2="27" y2="18" stroke="#444" stroke-width="1"/>
       <line x1="13" y1="18" x2="10" y2="17" stroke="#444" stroke-width="0.8"/>
       <line x1="35" y1="18" x2="38" y2="17" stroke="#444" stroke-width="0.8"/>`
    : "";

  // Beard
  const beardSvg = hasBeard
    ? `<rect x="13" y="24" width="22" height="5" fill="${beardColor}" opacity="0.85" rx="1"/>
       <rect x="15" y="29" width="18" height="3" fill="${beardColor}" opacity="0.65" rx="1"/>
       <rect x="17" y="32" width="14" height="2" fill="${beardColor}" opacity="0.45"/>`
    : "";

  // Mouth (smile if no beard)
  const mouthSvg = hasBeard ? "" :
    `<rect x="18" y="25" width="12" height="2" fill="${darken(skinTone, 40)}" rx="1"/>
     <rect x="20" y="26" width="8" height="1" fill="#c46060" opacity="0.4"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 80" width="${CHAR_W}" height="${CHAR_H}" style="image-rendering:pixelated">
    <!-- Hair -->
    ${hairSvg}
    <!-- Face -->
    <rect x="10" y="7" width="28" height="20" fill="${skinTone}" rx="2"/>
    <!-- Ears -->
    <rect x="8" y="14" width="3" height="6" fill="${skinTone}" rx="1"/>
    <rect x="37" y="14" width="3" height="6" fill="${skinTone}" rx="1"/>
    <!-- Eyebrows -->
    <rect x="14" y="13" width="7" height="2" fill="${darken(hairColor, 20)}" rx="1"/>
    <rect x="27" y="13" width="7" height="2" fill="${darken(hairColor, 20)}" rx="1"/>
    <!-- Eyes -->
    <rect x="14" y="16" width="6" height="5" fill="#fff" rx="1"/>
    <rect x="28" y="16" width="6" height="5" fill="#fff" rx="1"/>
    <rect x="16" y="17" width="3" height="3" fill="#2a3a4a"/>
    <rect x="30" y="17" width="3" height="3" fill="#2a3a4a"/>
    <rect x="17" y="17" width="1" height="1" fill="#fff" opacity="0.7"/>
    <rect x="31" y="17" width="1" height="1" fill="#fff" opacity="0.7"/>
    <!-- Nose -->
    <rect x="22" y="20" width="4" height="4" fill="${darken(skinTone, 15)}" rx="1"/>
    ${mouthSvg}
    ${glassesSvg}
    ${beardSvg}
    <!-- Neck -->
    <rect x="18" y="27" width="12" height="4" fill="${skinTone}"/>
    <!-- Body/shirt -->
    <rect x="8" y="31" width="32" height="18" fill="${shirtColor}" rx="2"/>
    <!-- Shirt collar -->
    <rect x="18" y="31" width="12" height="4" fill="${shirtDark}" rx="1"/>
    <!-- Shirt shading -->
    <rect x="8" y="42" width="32" height="4" fill="${shirtDark}" opacity="0.3"/>
    <!-- Arms -->
    <rect x="2" y="33" width="6" height="14" fill="${shirtColor}" rx="2"/>
    <rect x="40" y="33" width="6" height="14" fill="${shirtColor}" rx="2"/>
    <!-- Hands -->
    <rect x="2" y="47" width="6" height="4" fill="${skinTone}" rx="1"/>
    <rect x="40" y="47" width="6" height="4" fill="${skinTone}" rx="1"/>
    <!-- Belt -->
    <rect x="8" y="49" width="32" height="2" fill="#1a1a1a"/>
    <rect x="22" y="49" width="4" height="2" fill="#888" rx="0.5"/>
    <!-- Legs -->
    <rect x="10" y="51" width="12" height="16" fill="${pantsColor}"/>
    <rect x="26" y="51" width="12" height="16" fill="${pantsColor}"/>
    <!-- Leg shading -->
    <rect x="10" y="51" width="12" height="3" fill="${pantsDark}" opacity="0.3"/>
    <rect x="26" y="51" width="12" height="3" fill="${pantsDark}" opacity="0.3"/>
    <!-- Knee highlight -->
    <rect x="13" y="60" width="6" height="2" fill="${pantsColor}" opacity="0.6"/>
    <rect x="29" y="60" width="6" height="2" fill="${pantsColor}" opacity="0.6"/>
    <!-- Shoes -->
    <rect x="8" y="67" width="14" height="7" fill="${shoeColor}" rx="2"/>
    <rect x="26" y="67" width="14" height="7" fill="${shoeColor}" rx="2"/>
    <!-- Shoe sole -->
    <rect x="8" y="72" width="14" height="2" fill="${darken(shoeColor, 30)}"/>
    <rect x="26" y="72" width="14" height="2" fill="${darken(shoeColor, 30)}"/>
    <!-- Shoe highlight -->
    <rect x="10" y="68" width="4" height="2" fill="#fff" opacity="0.1" rx="0.5"/>
    <rect x="28" y="68" width="4" height="2" fill="#fff" opacity="0.1" rx="0.5"/>
  </svg>`;
}

interface SpeakerCharacter {
  code: string;
  name: string;
  firstName: string;
  talkTitle: string;
  traits: CharTraits;
}

function buildSpeakerData(): SpeakerCharacter[] {
  const talkMap = new Map<string, ScheduleItem>();
  for (const item of schedule) {
    if (item.isBreak || !item.speakerCodes.length) continue;
    for (const code of item.speakerCodes) {
      if (!talkMap.has(code)) {
        talkMap.set(code, item);
      }
    }
  }

  const chars: SpeakerCharacter[] = [];
  for (const [code, speaker] of Object.entries(speakers)) {
    const talk = talkMap.get(code);
    if (!talk) continue;

    const title = talk.title;

    chars.push({
      code,
      name: speaker.name,
      firstName: speaker.name.split(" ")[0],
      talkTitle: title,
      traits: generateTraits(code),
    });
  }
  return chars;
}

interface WalkingChar {
  data: SpeakerCharacter;
  x: number;
  direction: 1 | -1;
  speed: number;
  el: HTMLDivElement;
  nameEl: HTMLDivElement;
  bubbleEl: HTMLDivElement;
  walkPhase: number;
  showBubble: boolean;
  bubbleTimer: number;
  nextBubbleAt: number;
}

export function SpeakerParade() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speakerData = buildSpeakerData();
    if (speakerData.length === 0) return;

    let w = window.innerWidth;
    const chars: WalkingChar[] = [];
    let animId: number;

    speakerData.forEach((data, i) => {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;bottom:${BOTTOM_MARGIN}px;left:0;width:${CHAR_W}px;height:${CHAR_H}px;pointer-events:none;z-index:15;`;

      // Character SVG
      const charWrapper = document.createElement("div");
      charWrapper.innerHTML = createCharacterSvg(data.traits);
      el.appendChild(charWrapper);

      // Name label
      const nameEl = document.createElement("div");
      nameEl.style.cssText = `position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8px;color:rgba(230,248,246,0.5);font-family:var(--font-mono);text-align:center;`;
      nameEl.textContent = data.firstName;
      el.appendChild(nameEl);

      // Speech bubble
      const bubbleEl = document.createElement("div");
      bubbleEl.style.cssText = `position:absolute;bottom:${CHAR_H + 6}px;left:50%;transform:translateX(-50%);background:rgba(0,11,20,0.9);border:1px solid rgba(0,192,181,0.4);border-radius:6px;padding:5px 10px;font-size:10px;line-height:1.4;color:rgba(230,248,246,0.9);font-family:var(--font-mono);width:max-content;max-width:240px;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:20;`;
      bubbleEl.textContent = data.talkTitle;
      el.appendChild(bubbleEl);

      container.appendChild(el);

      const direction = (Math.random() > 0.5 ? 1 : -1) as 1 | -1;
      const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      const x = (i / speakerData.length) * (w - CHAR_W * 2) + CHAR_W;

      chars.push({
        data,
        x,
        direction,
        speed,
        el,
        nameEl,
        bubbleEl,
        walkPhase: Math.random() * Math.PI * 2,
        showBubble: false,
        bubbleTimer: 0,
        nextBubbleAt: Date.now() + 1000 + Math.random() * 4000,
      });

      el.style.left = `${x}px`;
      if (direction < 0) {
        el.style.transform = "scaleX(-1)";
        nameEl.style.transform = "translateX(-50%) scaleX(-1)";
        bubbleEl.style.transform = "translateX(-50%) scaleX(-1)";
      }
    });

    function animate() {
      const now = Date.now();

      for (const char of chars) {
        char.x += char.speed * char.direction;
        char.walkPhase += 0.1;

        if (char.x < 10) {
          char.direction = 1;
          char.x = 10;
        } else if (char.x > w - CHAR_W - 10) {
          char.direction = -1;
          char.x = w - CHAR_W - 10;
        }

        const bob = Math.sin(char.walkPhase) * 1.5;
        char.el.style.left = `${char.x}px`;
        char.el.style.bottom = `${BOTTOM_MARGIN + Math.abs(bob)}px`;

        if (char.direction < 0) {
          char.el.style.transform = "scaleX(-1)";
          char.nameEl.style.transform = "translateX(-50%) scaleX(-1)";
          char.bubbleEl.style.transform = "translateX(-50%) scaleX(-1)";
        } else {
          char.el.style.transform = "scaleX(1)";
          char.nameEl.style.transform = "translateX(-50%) scaleX(1)";
          char.bubbleEl.style.transform = "translateX(-50%) scaleX(1)";
        }

        // Expire bubbles
        if (char.showBubble && now - char.bubbleTimer > BUBBLE_DURATION_MS) {
          char.showBubble = false;
          char.bubbleEl.style.opacity = "0";
          char.nextBubbleAt = now + BUBBLE_MIN_MS + Math.random() * (BUBBLE_MAX_MS - BUBBLE_MIN_MS);
        }
      }

      // Allow new bubbles only if under limit and far enough from existing ones
      const MIN_BUBBLE_DISTANCE = w / (MAX_VISIBLE_BUBBLES + 1); // spread across screen
      const activeBubbles = chars.filter((c) => c.showBubble);

      // Sort candidates by readiness so earliest-ready gets priority
      const candidates = chars
        .filter((c) => !c.showBubble && now >= c.nextBubbleAt)
        .sort((a, b) => a.nextBubbleAt - b.nextBubbleAt);

      for (const char of candidates) {
        if (activeBubbles.length >= MAX_VISIBLE_BUBBLES) {
          char.nextBubbleAt = now + 2000 + Math.random() * 3000;
          continue;
        }

        // Check distance from all active bubbles
        const tooClose = activeBubbles.some(
          (active) => Math.abs(active.x - char.x) < MIN_BUBBLE_DISTANCE
        );

        if (tooClose) {
          // Delay — try again soon
          char.nextBubbleAt = now + 1500 + Math.random() * 2000;
          continue;
        }

        char.showBubble = true;
        char.bubbleTimer = now;
        char.bubbleEl.style.opacity = "1";
        activeBubbles.push(char);
      }

      // Stack overlapping bubbles
      const BUBBLE_W = 240;
      const BUBBLE_H = 50;
      const BASE_BOTTOM = CHAR_H + 6;

      const visibleBubbles = chars
        .filter((c) => c.showBubble)
        .sort((a, b) => a.x - b.x);

      for (const char of visibleBubbles) {
        char.bubbleEl.style.bottom = `${BASE_BOTTOM}px`;
      }

      for (let i = 0; i < visibleBubbles.length; i++) {
        let layer = 0;
        for (let j = 0; j < i; j++) {
          const dx = Math.abs(visibleBubbles[i].x - visibleBubbles[j].x);
          if (dx < BUBBLE_W) {
            layer++;
          }
        }
        // Cap stacking depth
        layer = Math.min(layer, MAX_STACK_LAYERS - 1);
        visibleBubbles[i].bubbleEl.style.bottom = `${BASE_BOTTOM + layer * (BUBBLE_H + 4)}px`;
      }

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    const onResize = () => { w = window.innerWidth; };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      chars.forEach((c) => c.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ overflow: "hidden" }}
    />
  );
}
