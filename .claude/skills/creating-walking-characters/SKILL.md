---
name: creating-walking-characters
description: Creates animated SVG characters that walk along the bottom edge of the display with speech bubbles, physics interactions, and special actions like shooting, power-ups, eating, and singing duets. Uses requestAnimationFrame with direct DOM manipulation. Use when adding interactive character animations.
---

# Creating Walking Characters

SVG characters walk along the bottom, interact with physics objects, have speech bubbles, and perform special actions.

## Two Character Systems

### 1. Gnomes (Fantasy Characters)
- Walk back and forth along the bottom
- Push physics objects (piled logos) as they walk
- Show speech bubbles with random messages
- When gnomes meet: sit down and eat pancakes
- Can shoot projectiles at flying objects
- Golden power-up: super saiyan mode (1.5x size, 3x speed, golden aura)
- Sing famous song duets

### 2. Named Characters (Real People)
- Independent from gnomes
- Walk similarly but simpler behavior
- Have conversations with each other (alternating speech bubbles)
- Distinct bubble colors per character
- No shooting, no power-ups

## Character Rendering

Characters are inline SVGs rendered as DOM elements (not React components):

```typescript
function createCharacterElement(type: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "walking-character";
  el.innerHTML = getCharacterSVG(type);
  el.style.position = "absolute";
  el.style.bottom = "0";
  container.appendChild(el);
  return el;
}
```

For SVG specs, see [reference/svg-character-specs.md](reference/svg-character-specs.md).

## Walking Behavior

```typescript
interface WalkingCharacter {
  el: HTMLDivElement;
  x: number;
  speed: number;         // pixels per frame
  direction: 1 | -1;    // 1 = right, -1 = left
  state: "walking" | "sitting" | "shooting";
}

// Each frame in RAF loop:
function updateCharacter(char: WalkingCharacter) {
  char.x += char.speed * char.direction;
  // Reverse at screen edges
  if (char.x > window.innerWidth - 60) char.direction = -1;
  if (char.x < 60) char.direction = 1;
  // Flip SVG when direction changes
  char.el.style.transform = `translateX(${char.x}px) scaleX(${char.direction})`;
}
```

### Bob Animation

Characters bob up and down while walking (CSS or JS):
```css
.walking-character {
  animation: character-bob 0.6s ease-in-out infinite;
}
@keyframes character-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
```

## Speech Bubbles

Appear above characters periodically (every 20-40 seconds):

```typescript
function showSpeechBubble(char: WalkingCharacter, text: string, duration: number = 4000) {
  const bubble = document.createElement("div");
  bubble.className = "speech-bubble";
  bubble.textContent = text;
  bubble.style.left = `${char.x}px`;
  bubble.style.bottom = "80px";
  // Clamp to viewport edges
  container.appendChild(bubble);
  setTimeout(() => bubble.remove(), duration);
}
```

For conversation system details, see [reference/conversation-system.md](reference/conversation-system.md).

## Physics Interaction

Characters push piled logos as they walk through them:
```typescript
piledBodies.forEach(body => {
  const dx = body.position.x - char.x;
  if (Math.abs(dx) < 30) {
    Matter.Body.applyForce(body, body.position, {
      x: char.direction * 0.002,
      y: -0.001,
    });
  }
});
```

## Special Actions

### Pancake Meeting
When two gnomes are within 50px: both stop, sit down, eating animation for 4 seconds, then resume.

### Shooting
Gnomes periodically fire projectiles (teal dots) at flying objects. 15% hit rate. Homing projectiles that track their target.

### Super Saiyan Mode
When a gnome picks up a golden power-up logo:
- 1.5x size increase
- 3x speed boost
- Golden aura glow effect
- Explosive push of nearby objects
- Duration: 8 seconds

### Singing Duets
Every ~2 minutes, gnomes alternate lines from famous songs:
- "Bohemian Rhapsody"
- "Never Gonna Give You Up"
- "Baby Shark"
- etc.

## Performance

- All characters managed in the same RAF loop as physics
- Direct DOM manipulation, no React state
- Speech bubbles are simple divs, removed after timeout
- SVGs are lightweight inline elements
