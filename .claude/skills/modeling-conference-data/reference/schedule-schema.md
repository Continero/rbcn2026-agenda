# Schedule Data Schema Reference

## Complete ScheduleItem Examples

A talk:
```typescript
{
  id: 1412208,
  code: "GDQVZ7",
  title: "RF-MCP: Say It, Test It, Ship It",
  abstract: "**Write plain English → Get executable Robot Framework tests**...",
  speakerCodes: ["T7BUER"],
  start: "2026-02-12T08:50:00Z",
  end: "2026-02-12T09:20:00Z",
  duration: 30,
  isBreak: false,
}
```

A break:
```typescript
{
  id: 1412207,
  title: "Breakfast",
  speakerCodes: [],
  start: "2026-02-12T08:10:00Z",
  end: "2026-02-12T08:50:00Z",
  duration: 40,
  isBreak: true,
}
```

A special event:
```typescript
{
  id: 9900001,
  title: "🍽️ Community Dinner — Ravintola Laulu",
  abstract: "Details about venue, timing, directions...",
  speakerCodes: [],
  start: "2026-02-12T16:30:00Z",
  end: "2026-02-12T18:30:00Z",
  duration: 120,
  isBreak: false,
}
```

## Speaker Entry Example

```typescript
{
  code: "T7BUER",
  name: "Many Kasiriha",
  avatar: "https://pretalx.com/media/avatars/T7BUER_vQtDHuy.webp",
}
```

## Data Source

Schedule data typically exported from a conference management platform (e.g., pretalx) and converted to TypeScript. Speaker codes and avatar URLs come from the same system.

## ID Conventions

- **Regular talks/breaks**: Use the ID from the source system
- **Special events**: Use a distinct range (e.g., 9900001+) to avoid collisions
