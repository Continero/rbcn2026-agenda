# Matter.js Integration Patterns

## Engine Setup

```typescript
import Matter from "matter-js";

const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
const world = engine.world;

// Ground and walls
const ground = Matter.Bodies.rectangle(
  window.innerWidth / 2, window.innerHeight + 25,
  window.innerWidth, 50,
  { isStatic: true }
);
const leftWall = Matter.Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true });
const rightWall = Matter.Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true });

Matter.Composite.add(world, [ground, leftWall, rightWall]);
```

## Creating Physics Bodies for Piled Objects

```typescript
function addToPile(x: number, y: number) {
  const body = Matter.Bodies.circle(x, y, 15, {
    restitution: 0.3,
    friction: 0.5,
    density: 0.001,
  });
  Matter.Composite.add(world, body);
  return body;
}
```

## Stepping the Engine

Inside the RAF loop:
```typescript
function animate() {
  Matter.Engine.update(engine, 1000 / 60);

  // Update DOM positions for piled objects
  piledLogos.forEach(({ body, el }) => {
    el.style.transform = `translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad)`;
  });

  requestAnimationFrame(animate);
}
```

## Cleanup

```typescript
return () => {
  Matter.Engine.clear(engine);
  Matter.World.clear(world, false);
  cancelAnimationFrame(rafId);
};
```

## Collision Detection

```typescript
Matter.Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((pair) => {
    // Check if a character body collided with a piled logo
    // Apply forces, trigger effects
  });
});
```

## Applying Forces

Push objects when characters walk through them:
```typescript
Matter.Body.applyForce(body, body.position, {
  x: direction * 0.002,
  y: -0.001,
});
```
