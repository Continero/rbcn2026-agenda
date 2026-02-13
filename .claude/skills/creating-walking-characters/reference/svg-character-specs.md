# SVG Character Specifications

## Gnome Characters

Two amigurumi-style gnomes: one with a red hat, one with a green hat. Each is approximately 40x60px. The design is a simple silhouette consisting of:

- **Triangular hat** (top, colored)
- **Round body** (middle, cream/off-white)
- **Small feet** (bottom, brown)

Use basic SVG shapes: `polygon` for the hat, `ellipse` for body and feet.

## Named Person Characters

Cartoon-style figures approximately 30x55px. Each has:

- **Circle head** with skin tone fill
- **Hair/hat** in a distinct color per character
- **Rectangle body** with rounded corners, shirt color varies
- **Two lines for legs**

Each named character should have a unique shirt color and hair style for visual distinction.

## Character Dimensions

| Character | Width | Height | Bottom offset |
|-----------|-------|--------|---------------|
| Gnome | 40px | 60px | 0px |
| Person | 30px | 55px | 5px |

## Direction Flipping

When a character walks left, flip horizontally with CSS:
```css
transform: scaleX(-1);
```

## Power-Up Visual

Golden aura effect via CSS filter:
```css
.powered-up {
  filter: brightness(1.3) drop-shadow(0 0 12px #bbc446);
  transform: scale(1.5);
}
```

## Implementation Notes

- SVGs are static — all movement is via CSS/JS transforms on the container div
- Keep SVGs lightweight (under 10 paths each)
- Characters are created as DOM elements, not React components
- Bob animation while walking: 3px vertical oscillation via CSS keyframes (0.6s cycle)
