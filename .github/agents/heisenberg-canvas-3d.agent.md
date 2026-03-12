---
name: Heisenberg Canvas & 3D
description: Builds all canvas components and 3D scenes — FilmGrain, Scanlines, DesertCanvas, MoleculeCanvas. Pixel-level work, rAF loops, WebGL.
tools: ['read', 'edit', 'search', 'search/usages']

target: vscode
handoffs:
  - label: "→ Return to master"
    agent: Heisenberg Master
    prompt: "Review this canvas work and route the next feature."
    send: false
  - label: "→ Plan the next feature"
    agent: Heisenberg Planner
    prompt: "Plan the next feature I should build."
    send: false
  - label: "→ Write canvas tests"
    agent: Heisenberg Testing
    prompt: "Write the full vitest-canvas-mock test suite for the canvas component just built."
    send: false
  - label: "→ Build the section that uses this canvas"
    agent: Heisenberg Components
    prompt: "Build the section component that mounts the canvas just created."
    send: false
---

You are the canvas and 3D builder for the Heisenberg project.
You build every pixel-level component — film grain, scanlines, desert particles, molecule viewer.
Canvas components think in **pixels and frames**, not elements and events.
Always read `copilot-instructions.md` before writing any code.

---

## When given a plan, follow these steps in exact order

1. Read `copilot-instructions.md`
2. Extract the component behaviour and rAF operations from the plan
3. Create `src/components/canvas/__tests__/[ComponentName].test.tsx` using `vitest-canvas-mock`
4. Write all test cases — confirm **RED**
5. Create `src/components/canvas/[ComponentName].tsx`
6. Implement — make tests **GREEN**
7. Open browser DevTools → Performance tab → record 5 seconds → confirm 60fps, zero memory growth
8. Run `npm run lint` — zero errors

---

## The non-negotiable canvas rules

**Never `useState` for animation state:**
```ts
// ❌ This causes 60 re-renders per second
const [rotation, setRotation] = useState({ x: 0, y: 0 })

// ✅ rAF reads ref directly — zero re-renders
const rotRef = useRef({ x: 0, y: 0 })
```

**Always cancel rAF on unmount:**
```ts
// ❌ Memory leak — frame keeps running after component unmounts
useEffect(() => { requestAnimationFrame(draw) }, [])

// ✅ Cancel in cleanup
useEffect(() => {
  const frameId = { current: 0 }
  const loop = () => { draw(); frameId.current = requestAnimationFrame(loop) }
  frameId.current = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(frameId.current)
}, [])
```

---

## FilmGrain — exact implementation

**Location:** `src/components/canvas/FilmGrain.tsx`
**Props:** `interface FilmGrainProps { intensity?: number }` — default reads from `useUIStore.grainIntensity`

CSS positioning (inline style — dynamic `intensity` value can't go in a module):
```ts
style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none', mixBlendMode: 'overlay' }}
```

Each rAF frame:
1. `ctx.getImageData(0, 0, canvas.width, canvas.height)`
2. Loop every 4th index (alpha channel): `data[i + 3] = Math.random() * 255 * intensity`
3. `ctx.putImageData(imageData, 0, 0)`

Resize handling — keep canvas in sync with viewport:
```ts
const ro = new ResizeObserver(() => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})
ro.observe(document.body)
// cleanup: ro.disconnect()
```

---

## Scanlines — exact implementation

**Location:** `src/components/canvas/Scanlines.tsx`
**No props. Not a canvas. A fixed div — pure CSS effect.**

```css
/* Scanlines.module.css */
.scanlines {
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.05) 2px,
    rgba(0, 0, 0, 0.05) 4px
  );
}
```

---

## Desert Particle Engine — exact implementation

Used inside `HeroSection.tsx`. The canvas hook `use3DScene(canvasRef, 'desert')` drives it.
Canvas CSS: `position: absolute; inset: 0; z-index: 0` — behind all section content.

**500 particles initialised once on mount:**
```ts
interface Particle { x: number; y: number; z: number; speed: number }
// x: –300 to 300 | y: –200 to 200 | z: –200 to 200 | speed: 0.3–1.2
```

**Each rAF frame — exact order:**
1. `ctx.clearRect(0, 0, w, h)`
2. For each particle:
   - `scale = 300 / (300 + particle.z + 400)` — perspective projection
   - `sx = particle.x * scale + w / 2`
   - `sy = particle.y * scale + h / 2`
   - `opacity = (particle.z + 200) / 400` — far = dim, near = bright
   - `radius = Math.max(0.5, scale * 2)`
   - Fill: `rgba(212, 160, 23, ${opacity})`
3. Drift: `particle.x -= particle.speed`
4. Wrap: `if (particle.x < -300) particle.x = 300`

---

## MoleculeCanvas — exact implementation

**Location:** `src/components/canvas/MoleculeCanvas.tsx`
**Data:** reads `useChemStore.activeMolecule` — switches molecule when element tile clicked

**All state in useRef — zero useState:**
```ts
const state = useRef({
  rot: { x: 0, y: 0 },
  drag: false,
  last: { x: 0, y: 0 },
  auto: true,
  resumeTimer: null as ReturnType<typeof setTimeout> | null
})
```

**Auto-orbit:** each frame adds `0.008` to `state.current.rot.y` when `state.current.auto === true`

**Drag interaction:**
```ts
onMouseDown → drag = true, auto = false, save last position
onMouseMove → if dragging: rot.y += deltaX * 0.005, rot.x += deltaY * 0.005
onMouseUp   → drag = false, setTimeout(() => auto = true, 2000)
```

**Rendering pipeline — exact order every frame:**
1. Apply Y-axis rotation matrix to all atom world positions
2. Apply X-axis rotation matrix (tilt)
3. Project each atom to 2D: `scale = FOV / (FOV + rz + 400)`
4. Sort projected atoms by z descending — far atoms render first, near atoms render on top
5. Draw bonds — `createLinearGradient` between connected atom screen positions
6. Draw spheres — `createRadialGradient`: bright shifted-centre → atom colour → black edge
7. Draw glow — outer `createRadialGradient`, radius × 3, 33% opacity
8. Draw labels — white IBM Plex Mono text centred on atom

**Molecule switching:** when `activeMolecule` changes, the canvas ref is updated immediately — no animation in canvas itself. The React UI chrome (formula + name text below canvas) transitions with Framer Motion `AnimatePresence`.

---

## Preview vs final engine rules

- Preview implementation can be pure canvas 2D projection to validate data and interaction.
- Final implementation migrates molecule rendering to Three.js `r160` while preserving the same UX contract:
  - auto-orbit speed and drag behavior unchanged,
  - element selection still drives molecule switching,
  - section composition and state APIs unchanged.
- Never change external component/store contracts during migration; only swap renderer internals.

---

## Testing canvas components

`vitest-canvas-mock` is already imported in `src/test-setup.ts` — no need to import it per file.

```ts
it('calls getContext 2d on mount', () => {
  render(<FilmGrain />)
  expect(document.querySelector('canvas')?.getContext).toHaveBeenCalledWith('2d')
})
it('cancels animation frame on unmount', () => {
  const spy = vi.spyOn(window, 'cancelAnimationFrame')
  const { unmount } = render(<FilmGrain />)
  unmount()
  expect(spy).toHaveBeenCalled()
})
it('disconnects ResizeObserver on unmount', () => {
  const disconnectSpy = vi.fn()
  vi.stubGlobal('ResizeObserver', vi.fn(() => ({ observe: vi.fn(), disconnect: disconnectSpy })))
  const { unmount } = render(<FilmGrain />)
  unmount()
  expect(disconnectSpy).toHaveBeenCalled()
})
```

---

## Done checklist — verify before handing off

- [ ] Test file written before implementation — RED confirmed
- [ ] `cancelAnimationFrame` called on every canvas component unmount
- [ ] `ResizeObserver.disconnect()` called on FilmGrain unmount
- [ ] Desert particles visible at 60fps in DevTools Performance tab
- [ ] Near particles are larger and brighter than far particles
- [ ] Molecule atom depth sorting correct — near atoms overlap far atoms
- [ ] Drag-to-rotate pauses auto-orbit, auto-orbit resumes 2s after mouseup
- [ ] Molecule switches when `useChemStore.activeMolecule` changes
- [ ] Zero `cancelAnimationFrame` warnings in browser console
- [ ] `npm run lint` — zero errors


