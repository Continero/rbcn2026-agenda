# Conversation System

## Speech Bubble Rendering

Speech bubbles are DOM elements positioned above characters:

```typescript
function showBubble(char: Character, text: string, color: string, duration = 4000) {
  const bubble = document.createElement("div");
  bubble.className = "speech-bubble";
  bubble.textContent = text;
  bubble.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: ${char.x}px;
    padding: 8px 12px;
    border-radius: 12px;
    background: ${color};
    color: #000011;
    font-size: 13px;
    max-width: 200px;
    white-space: pre-wrap;
    pointer-events: none;
    z-index: 20;
  `;
  // Clamp to viewport edges
  container.appendChild(bubble);
  requestAnimationFrame(() => {
    const rect = bubble.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      bubble.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.left < 0) bubble.style.left = "10px";
  });
  setTimeout(() => bubble.remove(), duration);
}
```

## Gnome Random Messages

Gnomes show random messages every 20-40 seconds:

```typescript
const gnomeMessages = [
  "Moi moi!",
  "Tervetuloa!",
  "Robot Framework!",
  "Testing is fun!",
  "Hello from Helsinki!",
  "🤖 beep boop",
];
```

## Named Character Conversations

Named characters have scripted conversations. They alternate lines with pauses between each.

```typescript
interface Conversation {
  lines: { speaker: string; text: string }[];
}

const conversations: Conversation[] = [
  {
    lines: [
      { speaker: "pekka", text: "The new RF 8 release is looking great" },
      { speaker: "rene", text: "The community feedback has been amazing" },
      { speaker: "pekka", text: "Time to start on RF 9!" },
    ],
  },
  // ... 15+ conversation scripts
];
```

### Conversation Flow

1. Pick a random conversation every ~60 seconds
2. Show first speaker's line (4 second display)
3. Pause 2 seconds
4. Show next speaker's line
5. Continue until all lines shown
6. Wait 60+ seconds before next conversation

### Distinct Bubble Colors

Each named character gets a unique bubble color:
- **Pekka**: golden-brown (`rgba(180, 140, 60, 0.95)`)
- **Mikka**: pink (`rgba(200, 100, 150, 0.95)`)
- **Rene**: blue-purple (`rgba(100, 80, 180, 0.95)`)

## Song Duets (Gnomes Only)

Every ~2 minutes, gnomes alternate lines from famous songs. Each gnome sings one line at a time with musical note emoji prefix.

```typescript
const songs = [
  {
    title: "Bohemian Rhapsody",
    lines: ["Is this the real life?", "Is this just fantasy?", "..."],
  },
  // More songs...
];
```

## Bubble Staggering

When multiple characters speak simultaneously, stagger bubble heights to prevent overlap. Track active bubbles and offset new ones vertically.

## Multi-Line Wrapping

Long messages wrap at `max-width: 200px` with `white-space: pre-wrap`. Keep messages under 40 characters when possible.
