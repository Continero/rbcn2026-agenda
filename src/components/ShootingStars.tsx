"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

const LOGO_SIZE = 20;
const MAX_FALLEN = 50;
const SPAWN_MIN_MS = 10000;
const SPAWN_MAX_MS = 20000;
const SPARK_COUNT = 8;
const FPS = 60;
const EDGE_MARGIN = 30; // pixels from edge to trigger impact

// RF logo SVG using currentColor for fill (inherits from parent CSS color)
const RF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 122.4325 122.34125" width="${LOGO_SIZE}" height="${LOGO_SIZE}">
  <g transform="matrix(1.25,0,0,-1.25,0,202.34125)">
    <g transform="translate(52.4477,88.1268)">
      <path fill="currentColor" d="m 0,0 c 0,7.6 6.179,13.779 13.77,13.779 7.6,0 13.779,-6.179 13.779,-13.779 0,-2.769 -2.238,-5.007 -4.998,-5.007 -2.761,0 -4.999,2.238 -4.999,5.007 0,2.078 -1.695,3.765 -3.782,3.765 C 11.693,3.765 9.997,2.078 9.997,0 9.997,-2.769 7.76,-5.007 4.999,-5.007 2.238,-5.007 0,-2.769 0,0 m 57.05,-23.153 c 0,-2.771 -2.237,-5.007 -4.998,-5.007 l -46.378,0 c -2.761,0 -4.999,2.236 -4.999,5.007 0,2.769 2.238,5.007 4.999,5.007 l 46.378,0 c 2.761,0 4.998,-2.238 4.998,-5.007 M 35.379,-2.805 c -1.545,2.291 -0.941,5.398 1.35,6.943 l 11.594,7.83 c 2.273,1.58 5.398,0.941 6.943,-1.332 1.545,-2.29 0.941,-5.398 -1.35,-6.943 l -11.594,-7.83 c -0.852,-0.586 -1.829,-0.87 -2.788,-0.87 -1.607,0 -3.187,0.781 -4.155,2.202 m 31.748,-30.786 c 0,-0.945 -0.376,-1.852 -1.045,-2.522 l -8.617,-8.617 c -0.669,-0.668 -1.576,-1.045 -2.523,-1.045 l -52.833,0 c -0.947,0 -1.854,0.377 -2.523,1.045 l -8.617,8.617 c -0.669,0.67 -1.045,1.577 -1.045,2.522 l 0,52.799 c 0,0.947 0.376,1.854 1.045,2.522 l 8.617,8.619 c 0.669,0.668 1.576,1.044 2.523,1.044 l 52.833,0 c 0.947,0 1.854,-0.376 2.523,-1.044 l 8.617,-8.619 c 0.669,-0.668 1.045,-1.575 1.045,-2.522 l 0,-52.799 z m 7.334,61.086 -11.25,11.25 c -1.705,1.705 -4.018,2.663 -6.428,2.663 l -56.523,0 c -2.412,0 -4.725,-0.959 -6.43,-2.665 L -17.412,27.494 c -1.704,-1.705 -2.661,-4.016 -2.661,-6.427 l 0,-56.515 c 0,-2.411 0.958,-4.725 2.663,-6.428 l 11.25,-11.25 c 1.705,-1.705 4.017,-2.662 6.428,-2.662 l 56.515,0 c 2.41,0 4.723,0.957 6.428,2.662 l 11.25,11.25 c 1.705,1.703 2.663,4.017 2.663,6.428 l 0,56.514 c 0,2.412 -0.958,4.724 -2.663,6.429"/>
    </g>
  </g>
</svg>`;

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

export function ShootingStars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    // Read timeboost param (speeds up spawn rate for testing)
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

        // Random direction — biased away from edges
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

        // Remove after animation
        setTimeout(() => spark.remove(), 800);
      }
    }

    // --- Spawn a shooting star ---
    function spawnStar() {
      const id = nextId++;

      // Randomly choose left-to-right or right-to-left
      const goingRight = Math.random() > 0.5;

      // Spawn from top (70%) or side edge (30%)
      const fromTop = Math.random() > 0.3;
      let x: number, y: number;
      if (fromTop) {
        x = goingRight ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5;
        y = -LOGO_SIZE;
      } else {
        x = goingRight ? -LOGO_SIZE : w + LOGO_SIZE;
        y = Math.random() * h * 0.4;
      }

      // Random angle: 30-60° downward, mirrored for direction
      const baseAngleDeg = 30 + Math.random() * 30;
      const angleDeg = goingRight ? baseAngleDeg : 180 - baseAngleDeg;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Speed: consistent pixels-per-frame for smooth flight
      const speed = 3 + Math.random() * 3;

      const el = createStarElement(false);

      flyingStars.push({
        id,
        x,
        y,
        vx: Math.cos(angleRad) * speed,
        vy: Math.sin(angleRad) * speed,
        angle: angleDeg,
        el,
      });
    }

    // --- Impact: sparks + convert to fallen physics body ---
    function impactStar(star: FlyingStar) {
      // Clamp position to screen edge
      const impactX = Math.max(LOGO_SIZE / 2, Math.min(star.x, w - LOGO_SIZE / 2));
      const impactY = Math.min(star.y, h - LOGO_SIZE / 2);

      // Create sparks at impact point
      createSparks(impactX, impactY);

      // Remove flying element
      star.el.remove();

      // Remove from flying array
      const idx = flyingStars.indexOf(star);
      if (idx !== -1) flyingStars.splice(idx, 1);

      // Create physics body — starts at impact point, falls straight down
      const body = Matter.Bodies.rectangle(impactX, impactY, LOGO_SIZE, LOGO_SIZE, {
        restitution: 0.3,
        friction: 0.8,
        angle: (Math.random() - 0.5) * 1,
        density: 0.001,
      });
      Matter.Composite.add(engine.world, [body]);

      // Create fallen logo element
      const el = createStarElement(true);
      fallenLogos.push({ id: star.id, body, el });

      // Cap at MAX_FALLEN — fade out oldest
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

    // --- Animation loop ---
    let frameId: number;
    function update() {
      // Update flying stars (iterate backward for safe removal)
      for (let i = flyingStars.length - 1; i >= 0; i--) {
        const star = flyingStars[i];
        star.x += star.vx;
        star.y += star.vy;

        star.el.style.transform = `translate(${star.x}px, ${star.y}px) rotate(${star.angle}deg)`;

        // Check if star hit any side edge or bottom edge
        const hitRight = star.vx > 0 && star.x + LOGO_SIZE >= w - EDGE_MARGIN;
        const hitLeft = star.vx < 0 && star.x <= EDGE_MARGIN;
        const hitBottom = star.y + LOGO_SIZE >= h - EDGE_MARGIN;

        if (hitRight || hitLeft || hitBottom) {
          impactStar(star);
        }
      }

      // Step physics
      Matter.Engine.update(engine, 1000 / FPS);

      // Sync fallen logos to physics bodies
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

    // First star appears sooner
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
