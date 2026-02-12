"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

const LOGO_SIZE = 20;
const MAX_FALLEN = 50;
const SPAWN_MIN_MS = 10000;
const SPAWN_MAX_MS = 20000;
const SPARK_COUNT = 8;
const FPS = 60;
const EDGE_MARGIN = 30;

// Gnome config
const GNOME_W = 24;
const GNOME_H = 40;
const GNOME_SPEED = 0.4; // pixels per frame
const GNOME_MARGIN = 60; // turn-around margin from edges
const GNOME_MEET_DISTANCE = 40; // pixels apart to trigger dance
const DANCE_DURATION = 180; // frames (~3 seconds at 60fps)
const DANCE_COOLDOWN = 300; // frames before they can dance again
const SHOOT_INTERVAL = 60; // frames (~1s at 60fps)
const PROJECTILE_SPEED = 8; // pixels per frame
const HIT_CHANCE = 0.15; // 15% hit rate
const FRAGMENT_SIZE = 12; // ~60% of LOGO_SIZE
const SUPER_SAIYAN_DURATION = 300; // frames (~5s)
const SUPER_SAIYAN_SPEED_MULT = 3;
const SUPER_SAIYAN_SCALE = 1.5;
const BUBBLE_MIN_MS = 20000;
const BUBBLE_MAX_MS = 40000;
const BUBBLE_DURATION_MS = 5000;
const SONG_INTERVAL_MS = 120000; // 2 minutes between songs
const SONG_LINE_MS = 2500; // each line shown for 2.5s

interface SongLine {
  gnome: number;
  text: string;
}

const SONGS: SongLine[][] = [
  // Bohemian Rhapsody
  [
    { gnome: 0, text: "Is this the real life? 🎤" },
    { gnome: 1, text: "Is this just fantasy?" },
    { gnome: 0, text: "Caught in a landslide..." },
    { gnome: 1, text: "No escape from reality!" },
    { gnome: 0, text: "Open your eyes..." },
    { gnome: 1, text: "Look up to the skies..." },
    { gnome: 0, text: "I'm just a poor boy 😢" },
    { gnome: 1, text: "Easy come, easy go!" },
  ],
  // Never Gonna Give You Up
  [
    { gnome: 0, text: "Never gonna give you up 🎵" },
    { gnome: 1, text: "Never gonna let you down!" },
    { gnome: 0, text: "Never gonna run around..." },
    { gnome: 1, text: "And desert you! 🎤" },
    { gnome: 0, text: "Never gonna make you cry!" },
    { gnome: 1, text: "Never gonna say goodbye!" },
    { gnome: 0, text: "Never gonna tell a lie..." },
    { gnome: 1, text: "And hurt you! 🕺" },
  ],
  // We Will Rock You
  [
    { gnome: 0, text: "Buddy you're a boy 🎵" },
    { gnome: 1, text: "Make a big noise!" },
    { gnome: 0, text: "Playin' in the street..." },
    { gnome: 1, text: "Gonna be a big man someday!" },
    { gnome: 0, text: "We will... 🥁" },
    { gnome: 1, text: "We will..." },
    { gnome: 0, text: "ROCK YOU! 🎸" },
    { gnome: 1, text: "ROCK YOU! 🤘" },
  ],
  // Don't Stop Believin'
  [
    { gnome: 0, text: "Just a small town girl 🎵" },
    { gnome: 1, text: "Livin' in a lonely world!" },
    { gnome: 0, text: "She took the midnight train" },
    { gnome: 1, text: "Goin' anywhere!" },
    { gnome: 0, text: "Don't stop... 🎤" },
    { gnome: 1, text: "Believin'!" },
    { gnome: 0, text: "Hold on to that feelin'!" },
    { gnome: 1, text: "Streetlight people! ✨" },
  ],
  // Hakuna Matata
  [
    { gnome: 0, text: "Hakuna Matata! 🎵" },
    { gnome: 1, text: "What a wonderful phrase!" },
    { gnome: 0, text: "Hakuna Matata..." },
    { gnome: 1, text: "Ain't no passing craze!" },
    { gnome: 0, text: "It means no worries 😎" },
    { gnome: 1, text: "For the rest of your days!" },
    { gnome: 0, text: "It's our problem-free..." },
    { gnome: 1, text: "Philosophy! 🦁" },
  ],
  // YMCA
  [
    { gnome: 0, text: "Young man! 🎵" },
    { gnome: 1, text: "There's no need to feel down!" },
    { gnome: 0, text: "I said young man!" },
    { gnome: 1, text: "Pick yourself off the ground!" },
    { gnome: 0, text: "It's fun to stay at the..." },
    { gnome: 1, text: "Y-M-C-A! 🕺" },
    { gnome: 0, text: "Y! M! C! A!" },
    { gnome: 1, text: "💃 Y-M-C-A! 💃" },
  ],
  // Baby Shark
  [
    { gnome: 0, text: "Baby shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Mama shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Daddy shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Run away! 🏃" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
  ],
];

const GNOME_MESSAGES = [
  "Robot Framework rocks! 🤖",
  "Automate all the things!",
  "Hello RoboCon 2026! 🎉",
  "Keywords are magic ✨",
  "Have a great conference!",
  "RF + Python = ❤️",
  "Testing made easy!",
  "Welcome to Helsinki! 🇫🇮",
  "Open source forever!",
  "Log files are my diary 📖",
  "*** Test Cases *** 🚀",
  "Keyword-driven FTW!",
  "RPA or testing? Both!",
  "Moi moi! 👋",
  "I love test automation!",
  "RF community is the best!",
  "Hyvää päivää! ☀️",
  "Keep calm and automate",
  "One framework to rule them all",
  "Tervetuloa! 🎊",
];

// RF logo SVG using currentColor for fill
const RF_PATH = "m 0,0 c 0,7.6 6.179,13.779 13.77,13.779 7.6,0 13.779,-6.179 13.779,-13.779 0,-2.769 -2.238,-5.007 -4.998,-5.007 -2.761,0 -4.999,2.238 -4.999,5.007 0,2.078 -1.695,3.765 -3.782,3.765 C 11.693,3.765 9.997,2.078 9.997,0 9.997,-2.769 7.76,-5.007 4.999,-5.007 2.238,-5.007 0,-2.769 0,0 m 57.05,-23.153 c 0,-2.771 -2.237,-5.007 -4.998,-5.007 l -46.378,0 c -2.761,0 -4.999,2.236 -4.999,5.007 0,2.769 2.238,5.007 4.999,5.007 l 46.378,0 c 2.761,0 4.998,-2.238 4.998,-5.007 M 35.379,-2.805 c -1.545,2.291 -0.941,5.398 1.35,6.943 l 11.594,7.83 c 2.273,1.58 5.398,0.941 6.943,-1.332 1.545,-2.29 0.941,-5.398 -1.35,-6.943 l -11.594,-7.83 c -0.852,-0.586 -1.829,-0.87 -2.788,-0.87 -1.607,0 -3.187,0.781 -4.155,2.202 m 31.748,-30.786 c 0,-0.945 -0.376,-1.852 -1.045,-2.522 l -8.617,-8.617 c -0.669,-0.668 -1.576,-1.045 -2.523,-1.045 l -52.833,0 c -0.947,0 -1.854,0.377 -2.523,1.045 l -8.617,8.617 c -0.669,0.67 -1.045,1.577 -1.045,2.522 l 0,52.799 c 0,0.947 0.376,1.854 1.045,2.522 l 8.617,8.619 c 0.669,0.668 1.576,1.044 2.523,1.044 l 52.833,0 c 0.947,0 1.854,-0.376 2.523,-1.044 l 8.617,-8.619 c 0.669,-0.668 1.045,-1.575 1.045,-2.522 l 0,-52.799 z m 7.334,61.086 -11.25,11.25 c -1.705,1.705 -4.018,2.663 -6.428,2.663 l -56.523,0 c -2.412,0 -4.725,-0.959 -6.43,-2.665 L -17.412,27.494 c -1.704,-1.705 -2.661,-4.016 -2.661,-6.427 l 0,-56.515 c 0,-2.411 0.958,-4.725 2.663,-6.428 l 11.25,-11.25 c 1.705,-1.705 4.017,-2.662 6.428,-2.662 l 56.515,0 c 2.41,0 4.723,0.957 6.428,2.662 l 11.25,11.25 c 1.705,1.703 2.663,4.017 2.663,6.428 l 0,56.514 c 0,2.412 -0.958,4.724 -2.663,6.429";

function rfSvg(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 122.4325 122.34125" width="${size}" height="${size}">
  <g transform="matrix(1.25,0,0,-1.25,0,202.34125)">
    <g transform="translate(52.4477,88.1268)">
      <path fill="currentColor" d="${RF_PATH}"/>
    </g>
  </g>
</svg>`;
}

const RF_SVG = rfSvg(LOGO_SIZE);

// Amigurumi gnome SVG — cute crocheted style with pointy hat, round body, beard
function gnomeSvg(hatColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="${GNOME_W}" height="${GNOME_H}">
    <!-- Pointy hat -->
    <polygon points="12,0 3,16 21,16" fill="${hatColor}"/>
    <polygon points="12,0 3,16 21,16" fill="rgba(0,0,0,0.1)"/>
    <!-- Hat brim texture -->
    <ellipse cx="12" cy="16" rx="10" ry="2" fill="${hatColor}" />
    <!-- Face -->
    <circle cx="12" cy="19" r="7" fill="#f0cda8"/>
    <!-- Eyes (bead style) -->
    <circle cx="9.5" cy="18" r="1.2" fill="#111"/>
    <circle cx="14.5" cy="18" r="1.2" fill="#111"/>
    <circle cx="10" cy="17.5" r="0.4" fill="#fff"/>
    <circle cx="15" cy="17.5" r="0.4" fill="#fff"/>
    <!-- Nose -->
    <circle cx="12" cy="20" r="1.5" fill="#e8b88a"/>
    <!-- Beard -->
    <ellipse cx="12" cy="25" rx="7" ry="5" fill="#f5f0e8"/>
    <ellipse cx="12" cy="26" rx="5.5" ry="4" fill="#fff"/>
    <!-- Body -->
    <rect x="5" y="28" width="14" height="7" rx="4" fill="#5c3a1e"/>
    <!-- Feet -->
    <ellipse cx="8" cy="36" rx="3.5" ry="2.5" fill="#4a2e14"/>
    <ellipse cx="16" cy="36" rx="3.5" ry="2.5" fill="#4a2e14"/>
  </svg>`;
}

interface FlyingStar {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  el: HTMLDivElement;
}

interface FallenLogo {
  id: number;
  body: Matter.Body;
  el: HTMLDivElement;
  glowing: boolean;
}

interface Gnome {
  x: number;
  direction: number; // 1 = right, -1 = left
  body: Matter.Body;
  el: HTMLDivElement;
  frame: number;
  bubbleEl: HTMLDivElement | null;
  dancing: boolean;
  danceFrame: number;
  danceCooldown: number;
  superSaiyan: boolean;
  superSaiyanFrame: number;
  shootFrame: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  el: HTMLDivElement;
  willHit: boolean;
  targetId: number;
  age: number;
}

export function ShootingStars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const params = new URLSearchParams(window.location.search);
    const timeBoost = Math.max(1, parseFloat(params.get("timeboost") || "1") || 1);

    // --- matter.js setup ---
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.8 } });
    const wallThickness = 40;

    const ground = Matter.Bodies.rectangle(
      w / 2, h + wallThickness / 2, w + 200, wallThickness,
      { isStatic: true }
    );
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2, h / 2, wallThickness, h * 2,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      w + wallThickness / 2, h / 2, wallThickness, h * 2,
      { isStatic: true }
    );
    Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

    // --- State ---
    const flyingStars: FlyingStar[] = [];
    const fallenLogos: FallenLogo[] = [];
    const projectiles: Projectile[] = [];
    let nextId = 0;

    // --- DOM element creation ---
    function createStarElement(isFallen: boolean): HTMLDivElement {
      const el = document.createElement("div");
      el.className = isFallen ? "fallen-logo" : "shooting-star";

      if (!isFallen) {
        const tail = document.createElement("div");
        tail.className = "shooting-star-tail";
        el.appendChild(tail);
      }

      const logoContainer = document.createElement("div");
      logoContainer.innerHTML = RF_SVG;
      el.appendChild(logoContainer);

      container!.appendChild(el);
      return el;
    }

    // --- Create sparks at impact point ---
    function createSparks(x: number, y: number) {
      const colors = ["#00c0b5", "#2ecbc2", "#bbc446", "#ffffff"];

      for (let i = 0; i < SPARK_COUNT; i++) {
        const spark = document.createElement("div");
        spark.className = "spark";

        const sparkAngle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        const dx = Math.cos(sparkAngle) * distance;
        const dy = Math.sin(sparkAngle) * distance;

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 2;

        spark.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 0 0 4px ${color};
          --spark-dx: ${dx}px;
          --spark-dy: ${dy}px;
          animation-duration: ${0.3 + Math.random() * 0.4}s;
        `;

        container!.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
      }
    }

    // --- Spawn a shooting star ---
    function spawnStar() {
      const id = nextId++;

      const goingRight = Math.random() > 0.5;
      const fromTop = Math.random() > 0.3;
      let x: number, y: number;
      if (fromTop) {
        x = goingRight ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5;
        y = -LOGO_SIZE;
      } else {
        x = goingRight ? -LOGO_SIZE : w + LOGO_SIZE;
        y = Math.random() * h * 0.4;
      }

      const baseAngleDeg = 30 + Math.random() * 30;
      const angleDeg = goingRight ? baseAngleDeg : 180 - baseAngleDeg;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = 3 + Math.random() * 3;

      const el = createStarElement(false);

      flyingStars.push({
        id, x, y,
        vx: Math.cos(angleRad) * speed,
        vy: Math.sin(angleRad) * speed,
        angle: angleDeg,
        el,
      });
    }

    // --- Impact: sparks + convert to fallen physics body ---
    function impactStar(star: FlyingStar, glowing: boolean = false) {
      const impactX = Math.max(LOGO_SIZE / 2, Math.min(star.x, w - LOGO_SIZE / 2));
      const impactY = Math.min(star.y, h - LOGO_SIZE / 2);

      createSparks(impactX, impactY);
      star.el.remove();

      const idx = flyingStars.indexOf(star);
      if (idx !== -1) flyingStars.splice(idx, 1);

      const body = Matter.Bodies.rectangle(impactX, impactY, LOGO_SIZE, LOGO_SIZE, {
        restitution: 0.3,
        friction: 0.8,
        angle: (Math.random() - 0.5) * 1,
        density: 0.001,
      });
      Matter.Composite.add(engine.world, [body]);

      const el = createStarElement(true);
      if (glowing) el.classList.add("fallen-logo-glowing");
      fallenLogos.push({ id: star.id, body, el, glowing });
      capFallenLogos();
    }

    // --- Cap fallen logos ---
    function capFallenLogos() {
      while (fallenLogos.length > MAX_FALLEN) {
        const oldest = fallenLogos.shift()!;
        oldest.el.classList.add("fallen-logo-fading");
        const bodyToRemove = oldest.body;
        const elToRemove = oldest.el;
        setTimeout(() => {
          elToRemove.remove();
          Matter.Composite.remove(engine.world, bodyToRemove);
        }, 2000);
      }
    }

    // --- Split star into fragments (shot hit) ---
    function splitStar(star: FlyingStar) {
      createSparks(star.x, star.y);
      star.el.remove();

      const idx = flyingStars.indexOf(star);
      if (idx !== -1) flyingStars.splice(idx, 1);

      const fragmentCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
      for (let i = 0; i < fragmentCount; i++) {
        const body = Matter.Bodies.rectangle(
          star.x + (Math.random() - 0.5) * 10,
          star.y + (Math.random() - 0.5) * 10,
          FRAGMENT_SIZE, FRAGMENT_SIZE,
          {
            restitution: 0.4,
            friction: 0.6,
            angle: Math.random() * Math.PI * 2,
            density: 0.0005,
          }
        );
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 4,
          y: -2 + Math.random() * 2,
        });
        Matter.Composite.add(engine.world, [body]);

        const el = document.createElement("div");
        el.className = "fallen-logo fallen-logo-fragment";
        const logoContainer = document.createElement("div");
        logoContainer.innerHTML = rfSvg(FRAGMENT_SIZE);
        el.appendChild(logoContainer);
        container!.appendChild(el);

        fallenLogos.push({ id: nextId++, body, el, glowing: false });
      }
      capFallenLogos();
    }

    // --- Gnomes setup ---
    function createGnome(hatColor: string, startX: number, direction: number): Gnome {
      // Physics body — static, moved manually to push fallen logos
      const gnomeY = h - GNOME_H / 2;
      const body = Matter.Bodies.rectangle(startX, gnomeY, GNOME_W, GNOME_H, {
        isStatic: true,
        friction: 0.5,
        restitution: 0,
      });
      Matter.Composite.add(engine.world, [body]);

      // DOM element
      const el = document.createElement("div");
      el.className = "gnome";
      el.innerHTML = gnomeSvg(hatColor);
      container!.appendChild(el);

      return { x: startX, direction, body, el, frame: 0, bubbleEl: null, dancing: false, danceFrame: 0, danceCooldown: 0, superSaiyan: false, superSaiyanFrame: 0, shootFrame: 0 };
    }

    // Show a speech bubble above a gnome
    function showBubble(gnome: Gnome, customMsg?: string, duration: number = BUBBLE_DURATION_MS) {
      // Remove existing bubble if any
      if (gnome.bubbleEl) gnome.bubbleEl.remove();

      const msg = customMsg || GNOME_MESSAGES[Math.floor(Math.random() * GNOME_MESSAGES.length)];
      const bubble = document.createElement("div");
      bubble.className = "gnome-bubble";
      bubble.textContent = msg;
      container!.appendChild(bubble);
      gnome.bubbleEl = bubble;

      // Fade out and remove after duration
      setTimeout(() => {
        bubble.classList.add("gnome-bubble-fading");
        setTimeout(() => {
          bubble.remove();
          if (gnome.bubbleEl === bubble) gnome.bubbleEl = null;
        }, 1000);
      }, duration);
    }

    // Two gnomes: red hat starts left, green hat starts right
    const gnomes: Gnome[] = [
      createGnome("#cc4444", w * 0.25, 1),
      createGnome("#4a8c3f", w * 0.75, -1),
    ];

    // --- Bubble timer ---
    let bubbleTimerId: ReturnType<typeof setTimeout>;
    let singing = false;

    function scheduleBubble() {
      const delay = (BUBBLE_MIN_MS + Math.random() * (BUBBLE_MAX_MS - BUBBLE_MIN_MS)) / timeBoost;
      bubbleTimerId = setTimeout(() => {
        if (!singing) {
          const gnome = gnomes[Math.floor(Math.random() * gnomes.length)];
          showBubble(gnome);
        }
        scheduleBubble();
      }, delay);
    }

    // First bubble sooner
    bubbleTimerId = setTimeout(() => {
      if (!singing) showBubble(gnomes[0]);
      scheduleBubble();
    }, (5000 + Math.random() * 5000) / timeBoost);

    // --- Song timer ---
    let songTimerId: ReturnType<typeof setTimeout>;
    const songTimeouts: ReturnType<typeof setTimeout>[] = [];
    let lastSongIdx = -1;

    function playSong() {
      // Don't sing while dancing
      if (gnomes[0].dancing || gnomes[1].dancing) {
        songTimerId = setTimeout(playSong, 5000 / timeBoost);
        return;
      }

      singing = true;

      // Pick a song (avoid repeating the last one)
      let idx = Math.floor(Math.random() * SONGS.length);
      if (idx === lastSongIdx && SONGS.length > 1) idx = (idx + 1) % SONGS.length;
      lastSongIdx = idx;
      const song = SONGS[idx];

      // Schedule each line
      song.forEach((line, i) => {
        const tid = setTimeout(() => {
          showBubble(gnomes[line.gnome], line.text, 2000);
        }, i * SONG_LINE_MS);
        songTimeouts.push(tid);
      });

      // End of song
      const endTid = setTimeout(() => {
        singing = false;
        scheduleSong();
      }, song.length * SONG_LINE_MS + 1000);
      songTimeouts.push(endTid);
    }

    function scheduleSong() {
      songTimerId = setTimeout(playSong, SONG_INTERVAL_MS / timeBoost);
    }

    // First song after 30-60s
    songTimerId = setTimeout(playSong, (30000 + Math.random() * 30000) / timeBoost);

    // --- Animation loop ---
    let frameId: number;
    function update() {
      // Update flying stars
      for (let i = flyingStars.length - 1; i >= 0; i--) {
        const star = flyingStars[i];
        star.x += star.vx;
        star.y += star.vy;

        star.el.style.transform = `translate(${star.x}px, ${star.y}px) rotate(${star.angle}deg)`;

        const hitRight = star.vx > 0 && star.x + LOGO_SIZE >= w - EDGE_MARGIN;
        const hitLeft = star.vx < 0 && star.x <= EDGE_MARGIN;
        const hitBottom = star.y + LOGO_SIZE >= h - EDGE_MARGIN;

        if (hitRight || hitLeft) {
          // Bounce off wall — reverse horizontal, add sparks
          star.vx = -star.vx;
          star.angle = 180 - star.angle;
          star.x = hitRight ? w - EDGE_MARGIN - LOGO_SIZE : EDGE_MARGIN + 1;
          createSparks(hitRight ? w - EDGE_MARGIN : EDGE_MARGIN, star.y);
        } else if (hitBottom) {
          impactStar(star, true);
        }
      }

      // Check if gnomes should start dancing
      const g0 = gnomes[0];
      const g1 = gnomes[1];
      const gnomeDistance = Math.abs(g0.x - g1.x);

      if (!g0.dancing && !g1.dancing && !g0.superSaiyan && !g1.superSaiyan && g0.danceCooldown <= 0 && g1.danceCooldown <= 0 && gnomeDistance < GNOME_MEET_DISTANCE) {
        // Start dancing!
        g0.dancing = true;
        g1.dancing = true;
        g0.danceFrame = 0;
        g1.danceFrame = 0;

        // Spawn floating music notes between them
        const midX = (g0.x + g1.x) / 2;
        const notes = ["♪", "♫", "♬", "🎵"];
        for (let i = 0; i < 4; i++) {
          const note = document.createElement("div");
          note.className = "gnome-note";
          note.textContent = notes[i];
          note.style.left = `${midX + (Math.random() - 0.5) * 30}px`;
          note.style.top = `${h - GNOME_H - 10}px`;
          note.style.animationDelay = `${i * 0.3}s`;
          container!.appendChild(note);
          setTimeout(() => note.remove(), 3000);
        }
      }

      // Update gnomes
      for (const gnome of gnomes) {
        gnome.frame++;
        const gnomeY = h - GNOME_H / 2;

        if (gnome.dancing) {
          gnome.danceFrame++;

          // Synchronized bounce dance — faster bobbing + side-to-side sway
          const danceBob = Math.sin(gnome.danceFrame * 0.4) * 5;
          const danceSway = Math.sin(gnome.danceFrame * 0.2) * 4;
          const gnomeVisualY = gnomeY - GNOME_H / 2 + danceBob;

          // Face each other during dance
          const faceDir = gnome === g0 ? (g1.x > g0.x ? 1 : -1) : (g0.x > g1.x ? 1 : -1);
          gnome.el.style.transform = `translate(${gnome.x - GNOME_W / 2 + danceSway}px, ${gnomeVisualY}px) scaleX(${faceDir})`;

          // Keep physics body in place
          Matter.Body.setPosition(gnome.body, { x: gnome.x, y: gnomeY });
          Matter.Body.setVelocity(gnome.body, { x: 0, y: 0 });

          // Position bubble
          if (gnome.bubbleEl) {
            gnome.bubbleEl.style.left = `${gnome.x + danceSway}px`;
            gnome.bubbleEl.style.top = `${gnomeVisualY - 30}px`;
          }

          // End dance after duration
          if (gnome.danceFrame >= DANCE_DURATION) {
            gnome.dancing = false;
            gnome.danceCooldown = DANCE_COOLDOWN;
            // Reverse direction after dance
            gnome.direction = gnome === g0 ? -1 : 1;
          }
        } else {
          if (gnome.danceCooldown > 0) gnome.danceCooldown--;

          // Super saiyan timer
          if (gnome.superSaiyan) {
            gnome.superSaiyanFrame++;
            if (gnome.superSaiyanFrame >= SUPER_SAIYAN_DURATION) {
              gnome.superSaiyan = false;
              gnome.el.classList.remove("gnome-super-saiyan");
            }
          }

          const speedMult = gnome.superSaiyan ? SUPER_SAIYAN_SPEED_MULT : 1;
          const scaleMult = gnome.superSaiyan ? SUPER_SAIYAN_SCALE : 1;
          gnome.x += GNOME_SPEED * gnome.direction * speedMult;

          // Turn around at edges
          if (gnome.x >= w - GNOME_MARGIN) {
            gnome.direction = -1;
          } else if (gnome.x <= GNOME_MARGIN) {
            gnome.direction = 1;
          }

          // Move physics body — this pushes fallen logos
          Matter.Body.setPosition(gnome.body, { x: gnome.x, y: gnomeY });
          Matter.Body.setVelocity(gnome.body, { x: GNOME_SPEED * gnome.direction * 2 * speedMult, y: 0 });

          // Super saiyan: explosive push on nearby fallen logos
          if (gnome.superSaiyan) {
            for (const logo of fallenLogos) {
              const { x: lx, y: ly } = logo.body.position;
              const dx = lx - gnome.x;
              const dy = ly - gnomeY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 60 && dist > 5) {
                const force = 0.003;
                Matter.Body.applyForce(logo.body, logo.body.position, {
                  x: (dx / dist) * force * gnome.direction,
                  y: -force * 0.5,
                });
              }
            }
          }

          // Pick up glowing logos → super saiyan
          if (!gnome.superSaiyan) {
            for (let li = fallenLogos.length - 1; li >= 0; li--) {
              const logo = fallenLogos[li];
              if (!logo.glowing) continue;
              const { x: lx, y: ly } = logo.body.position;
              const dx = gnome.x - lx;
              const dy = gnomeY - ly;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 35) {
                // Eat the glowing logo — go super saiyan!
                gnome.superSaiyan = true;
                gnome.superSaiyanFrame = 0;
                gnome.el.classList.add("gnome-super-saiyan");
                logo.el.remove();
                Matter.Composite.remove(engine.world, logo.body);
                fallenLogos.splice(li, 1);
                createSparks(lx, ly);
                break;
              }
            }
          }

          // Bobbing walk animation
          const bob = Math.sin(gnome.frame * 0.15) * (gnome.superSaiyan ? 4 : 2);
          const scaleX = gnome.direction >= 0 ? 1 : -1;
          const gnomeVisualY = gnomeY - (GNOME_H * scaleMult) / 2 + bob;

          gnome.el.style.transform = `translate(${gnome.x - (GNOME_W * scaleMult) / 2}px, ${gnomeVisualY}px) scale(${scaleX * scaleMult}, ${scaleMult})`;

          // Position bubble above gnome
          if (gnome.bubbleEl) {
            gnome.bubbleEl.style.left = `${gnome.x}px`;
            gnome.bubbleEl.style.top = `${gnomeVisualY - 30}px`;
          }
        }
      }

      // --- Both gnomes shooting ---
      for (const shooter of gnomes) {
        if (shooter.dancing || flyingStars.length === 0) continue;
        shooter.shootFrame++;
        if (shooter.shootFrame < SHOOT_INTERVAL) continue;
        shooter.shootFrame = 0;

        // Find closest flying star
        let closest: FlyingStar | null = null;
        let closestDist = Infinity;
        const gnomeTopY = h - GNOME_H;
        for (const star of flyingStars) {
          const dx = star.x - shooter.x;
          const dy = star.y - gnomeTopY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closest = star;
          }
        }

        if (!closest) continue;

        if (shooter.superSaiyan) {
          // Gold laser — instant hit, always connects
          const gnomeTopY2 = h - GNOME_H;
          const dx = closest.x - shooter.x;
          const dy = closest.y - gnomeTopY2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          // Create laser beam element
          const laser = document.createElement("div");
          laser.className = "gnome-laser";
          laser.style.left = `${shooter.x}px`;
          laser.style.top = `${gnomeTopY2}px`;
          laser.style.width = `${dist}px`;
          laser.style.transform = `rotate(${angle}rad)`;
          container!.appendChild(laser);
          setTimeout(() => laser.remove(), 300);

          // Instant hit — split the star
          splitStar(closest);
        } else {
          // Normal projectile
          const willHit = Math.random() < HIT_CHANCE;
          const gnomeTopY2 = h - GNOME_H;
          const dx = closest.x - shooter.x;
          const dy = closest.y - gnomeTopY2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let vx = (dx / dist) * PROJECTILE_SPEED;
          let vy = (dy / dist) * PROJECTILE_SPEED;

          if (!willHit) {
            const offsetAngle = ((Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 20) * Math.PI) / 180;
            const cos = Math.cos(offsetAngle);
            const sin = Math.sin(offsetAngle);
            const nvx = vx * cos - vy * sin;
            const nvy = vx * sin + vy * cos;
            vx = nvx;
            vy = nvy;
          }

          const angle = Math.atan2(vy, vx);
          const el = document.createElement("div");
          el.className = "gnome-projectile";
          container!.appendChild(el);

          projectiles.push({
            x: shooter.x,
            y: gnomeTopY2,
            vx, vy, angle,
            el,
            willHit,
            targetId: closest.id,
            age: 0,
          });
        }
      }

      // --- Update projectiles ---
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.age++;

        proj.el.style.transform = `translate(${proj.x - 2}px, ${proj.y - 2}px) rotate(${proj.angle}rad)`;

        let remove = false;

        if (proj.willHit) {
          const target = flyingStars.find(s => s.id === proj.targetId);
          if (target) {
            const dx = target.x - proj.x;
            const dy = target.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Direct homing — always steer toward target
            if (dist > 0) {
              proj.vx = (dx / dist) * PROJECTILE_SPEED;
              proj.vy = (dy / dist) * PROJECTILE_SPEED;
              proj.angle = Math.atan2(proj.vy, proj.vx);
            }

            if (dist < 20) {
              splitStar(target);
              remove = true;
            }
          } else {
            // Target already gone (hit edge)
            remove = true;
          }
        }

        // Remove if off-screen or too old
        if (proj.x < -20 || proj.x > w + 20 || proj.y < -20 || proj.y > h + 20 || proj.age > 120) {
          remove = true;
        }

        if (remove) {
          proj.el.remove();
          projectiles.splice(i, 1);
        }
      }

      // Step physics
      Matter.Engine.update(engine, 1000 / FPS);

      // Sync fallen logos
      for (const logo of fallenLogos) {
        const { x, y } = logo.body.position;
        const angle = logo.body.angle;
        logo.el.style.transform = `translate(${x - LOGO_SIZE / 2}px, ${y - LOGO_SIZE / 2}px) rotate(${angle}rad)`;
      }

      frameId = requestAnimationFrame(update);
    }
    frameId = requestAnimationFrame(update);

    // --- Spawn timer ---
    let spawnTimerId: ReturnType<typeof setTimeout>;

    function scheduleSpawn() {
      const delay = (SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS)) / timeBoost;
      spawnTimerId = setTimeout(() => {
        spawnStar();
        scheduleSpawn();
      }, delay);
    }

    spawnTimerId = setTimeout(() => {
      spawnStar();
      scheduleSpawn();
    }, (2000 + Math.random() * 3000) / timeBoost);

    // --- Handle resize ---
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      Matter.Body.setPosition(ground, { x: w / 2, y: h + wallThickness / 2 });
      Matter.Body.setPosition(rightWall, { x: w + wallThickness / 2, y: h / 2 });
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(spawnTimerId);
      clearTimeout(bubbleTimerId);
      clearTimeout(songTimerId);
      songTimeouts.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      Matter.Engine.clear(engine);
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
}
