# Component Specifications

## DayTab Sub-component

Pill-shaped tab showing active day:

```tsx
function DayTab({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`py-4 text-2xl font-bold rounded-full transition-colors ${
      active ? "bg-teal text-navy" : "bg-cyan-10 text-cyan-60"
    }`} style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      {label}
    </span>
  );
}
```

## UpNextItem Sub-component

Each item in the Up Next list:
- Layout: `[time] [title + speaker + abstract] [duration]`
- `isFirst`: highlighted background (`bg-cyan/[0.03]`)
- `isHighlight`: golden shimmer for special events
- Click toggles abstract expansion
- Breaks: dimmed, italic, no speaker, no expansion

### Highlight Detection
```typescript
const isHighlight = (() => {
  const t = item.title.toLowerCase();
  return t.includes("karaoke") || t.includes("after-party");
})();
```

## Mobile Responsive Sizing

Three breakpoints worth of sizing on all components:
```
text-base sm:text-xl lg:text-2xl
px-4 sm:px-6 lg:px-10
gap-3 sm:gap-4 lg:gap-5
w-8 sm:w-10 lg:w-12  (avatar sizes)
```

## BreakCard Emoji Mapping

```typescript
function getBreakEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("breakfast")) return "☕";
  if (lower.includes("lunch")) return "🍝";
  if (lower.includes("coffee")) return "☕";
  if (lower.includes("afternoon treat")) return "🍰";
  if (lower.includes("lightning")) return "⚡";
  if (lower.includes("elevator") || lower.includes("sponsor")) return "🎤";
  if (lower.includes("voting")) return "🗳️";
  return "⏸️";
}
```

## Conference Logo

Inline SVG component. For RoboCon, this is the RF logo rendered in teal (#00c0b5). The logo SVG should be extracted from the conference brand assets and wrapped in a React component.

## UpNext Auto-Expand Logic

```typescript
const firstTalkId = items.find(item => !item.isBreak && item.abstract)?.id ?? null;
const [expandedId, setExpandedId] = useState<number | null>(firstTalkId);
const prevFirstId = useRef(firstTalkId);

useEffect(() => {
  if (firstTalkId !== prevFirstId.current) {
    setExpandedId(firstTalkId);
    prevFirstId.current = firstTalkId;
  }
}, [firstTalkId]);
```

This re-expands the first talk whenever the schedule advances (a new talk becomes first).
