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
const BUBBLE_MIN_MS = 20000;
const BUBBLE_MAX_MS = 40000;
const BUBBLE_DURATION_MS = 5000;

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
const RF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 122.4325 122.34125" width="${LOGO_SIZE}" height="${LOGO_SIZE}">
  <g transform="matrix(1.25,0,0,-1.25,0,202.34125)">
    <g transform="translate(52.4477,88.1268)">
      <path fill="currentColor" d="m 0,0 c 0,7.6 6.179,13.779 13.77,13.779 7.6,0 13.779,-6.179 13.779,-13.779 0,-2.769 -2.238,-5.007 -4.998,-5.007 -2.761,0 -4.999,2.238 -4.999,5.007 0,2.078 -1.695,3.765 -3.782,3.765 C 11.693,3.765 9.997,2.078 9.997,0 9.997,-2.769 7.76,-5.007 4.999,-5.007 2.238,-5.007 0,-2.769 0,0 m 57.05,-23.153 c 0,-2.771 -2.237,-5.007 -4.998,-5.007 l -46.378,0 c -2.761,0 -4.999,2.236 -4.999,5.007 0,2.769 2.238,5.007 4.999,5.007 l 46.378,0 c 2.761,0 4.998,-2.238 4.998,-5.007 M 35.379,-2.805 c -1.545,2.291 -0.941,5.398 1.35,6.943 l 11.594,7.83 c 2.273,1.58 5.398,0.941 6.943,-1.332 1.545,-2.29 0.941,-5.398 -1.35,-6.943 l -11.594,-7.83 c -0.852,-0.586 -1.829,-0.87 -2.788,-0.87 -1.607,0 -3.187,0.781 -4.155,2.202 m 31.748,-30.786 c 0,-0.945 -0.376,-1.852 -1.045,-2.522 l -8.617,-8.617 c -0.669,-0.668 -1.576,-1.045 -2.523,-1.045 l -52.833,0 c -0.947,0 -1.854,0.377 -2.523,1.045 l -8.617,8.617 c -0.669,0.67 -1.045,1.577 -1.045,2.522 l 0,52.799 c 0,0.947 0.376,1.854 1.045,2.522 l 8.617,8.619 c 0.669,0.668 1.576,1.044 2.523,1.044 l 52.833,0 c 0.947,0 1.854,-0.376 2.523,-1.044 l 8.617,-8.619 c 0.669,-0.668 1.045,-1.575 1.045,-2.522 l 0,-52.799 z m 7.334,61.086 -11.25,11.25 c -1.705,1.705 -4.018,2.663 -6.428,2.663 l -56.523,0 c -2.412,0 -4.725,-0.959 -6.43,-2.665 L -17.412,27.494 c -1.704,-1.705 -2.661,-4.016 -2.661,-6.427 l 0,-56.515 c 0,-2.411 0.958,-4.725 2.663,-6.428 l 11.25,-11.25 c 1.705,-1.705 4.017,-2.662 6.428,-2.662 l 56.515,0 c 2.41,0 4.723,0.957 6.428,2.662 l 11.25,11.25 c 1.705,1.703 2.663,4.017 2.663,6.428 l 0,56.514 c 0,2.412 -0.958,4.724 -2.663,6.429"/>
    </g>
  </g>
</svg>`;

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
    function impactStar(star: FlyingStar) {
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
      fallenLogos.push({ id: star.id, body, el });

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

      return { x: startX, direction, body, el, frame: 0, bubbleEl: null, dancing: false, danceFrame: 0, danceCooldown: 0 };
    }

    // Show a speech bubble above a gnome
    function showBubble(gnome: Gnome) {
      // Remove existing bubble if any
      if (gnome.bubbleEl) gnome.bubbleEl.remove();

      const msg = GNOME_MESSAGES[Math.floor(Math.random() * GNOME_MESSAGES.length)];
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
      }, BUBBLE_DURATION_MS);
    }

    // Two gnomes: red hat starts left, green hat starts right
    const gnomes: Gnome[] = [
      createGnome("#cc4444", w * 0.25, 1),
      createGnome("#4a8c3f", w * 0.75, -1),
    ];

    // --- Bubble timer ---
    let bubbleTimerId: ReturnType<typeof setTimeout>;
    let lastMessageIdx = -1;

    function scheduleBubble() {
      const delay = (BUBBLE_MIN_MS + Math.random() * (BUBBLE_MAX_MS - BUBBLE_MIN_MS)) / timeBoost;
      bubbleTimerId = setTimeout(() => {
        // Pick a random gnome
        const gnome = gnomes[Math.floor(Math.random() * gnomes.length)];
        showBubble(gnome);
        scheduleBubble();
      }, delay);
    }

    // First bubble sooner
    bubbleTimerId = setTimeout(() => {
      showBubble(gnomes[0]);
      scheduleBubble();
    }, (5000 + Math.random() * 5000) / timeBoost);

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

        if (hitRight || hitLeft || hitBottom) {
          impactStar(star);
        }
      }

      // Check if gnomes should start dancing
      const g0 = gnomes[0];
      const g1 = gnomes[1];
      const gnomeDistance = Math.abs(g0.x - g1.x);

      if (!g0.dancing && !g1.dancing && g0.danceCooldown <= 0 && g1.danceCooldown <= 0 && gnomeDistance < GNOME_MEET_DISTANCE) {
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
          gnome.x += GNOME_SPEED * gnome.direction;

          // Turn around at edges
          if (gnome.x >= w - GNOME_MARGIN) {
            gnome.direction = -1;
          } else if (gnome.x <= GNOME_MARGIN) {
            gnome.direction = 1;
          }

          // Move physics body — this pushes fallen logos
          Matter.Body.setPosition(gnome.body, { x: gnome.x, y: gnomeY });
          Matter.Body.setVelocity(gnome.body, { x: GNOME_SPEED * gnome.direction * 2, y: 0 });

          // Bobbing walk animation
          const bob = Math.sin(gnome.frame * 0.15) * 2;
          const scaleX = gnome.direction >= 0 ? 1 : -1;
          const gnomeVisualY = gnomeY - GNOME_H / 2 + bob;

          gnome.el.style.transform = `translate(${gnome.x - GNOME_W / 2}px, ${gnomeVisualY}px) scaleX(${scaleX})`;

          // Position bubble above gnome
          if (gnome.bubbleEl) {
            gnome.bubbleEl.style.left = `${gnome.x}px`;
            gnome.bubbleEl.style.top = `${gnomeVisualY - 30}px`;
          }
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
