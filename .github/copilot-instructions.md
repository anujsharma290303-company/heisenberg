# HEISENBERG - Master Copilot Instructions

Confidential / Internal Use Only.

This file is the single source of truth for all Heisenberg agents.
Every agent must read this file before planning, coding, styling, or testing.

## 1) Product Definition

Heisenberg is a single-page, scroll-driven interactive character and quote explorer inspired by Breaking Bad.

Non-negotiable product constraints:
- Exactly one URL and one scroll container.
- No React Router, no page-level navigation, no multi-page flow.
- Exactly four full-viewport sections with scroll snap.
- Primary user actions:
	- Scroll between sections.
	- Select character cards to filter quotes.
	- Select chemistry elements to drive molecule state.
- URL query params may reflect selected quote/character/element for shareability, but route never changes.

Required state sync behavior:
- Base: selected quote and selected element update URL search params.
- Optional stretch: selected character also syncs.
- Rehydrate shareable state from URL on initial load.

## 2) Core Architecture

Scroll container rules:
- The only scrollable element is the root page container.
- Use `scroll-snap-type: y mandatory` on the container.
- Each section uses `scroll-snap-align: start` and `min-height: 100svh`.

Section IDs:
- `section-01` Hero
- `section-02` Character Timeline
- `section-03` Quotes Wall
- `section-04` Chemistry Explorer

IntersectionObserver rules:
- Track active section in global UI state.
- Threshold must be `0.45`.
- Add `.revealed` when section enters view.
- Off-screen animations should not run early.

Persistent overlays (always mounted):
- Film grain canvas at z-index 9998.
- CRT scanlines overlay at z-index 9997.
- 4-dot fixed section navigator.

## 3) Visual Language

Tone: dark, cinematic, oppressive, high contrast.

### Color tokens (required)

Use these exact CSS custom properties:
- `--color-void: #080808`
- `--color-surface: #0F0F0F`
- `--color-crystal: #4FC3F7`
- `--color-hat: #D4A017`
- `--color-paper: #E8E2D5`
- `--color-smoke: #444444`
- `--color-ghost: #777777`
- `--color-danger: #C0392B`
- `--color-green: #27AE60`
- `--color-grain: rgba(255,255,255,0.028)`

### Typography rules

Font roles:
- Display titles: Bebas Neue
- Quote and narrative text: IBM Plex Serif
- Mono metadata labels: IBM Plex Mono
- UI controls: Inter fallback stack

Sizing rule:
- No fixed `px` font sizes.
- All font sizes must use `clamp()` or typography tokens built from `clamp()`.

Tracking tokens:
- `--tracking-display: 0.04em`
- `--tracking-mono: 0.2em`
- `--tracking-wide: 0.35em`

### Signature effects

Film grain:
- Canvas with requestAnimationFrame noise updates.
- Blend with `mix-blend-mode: overlay`.
- Normal intensity around `0.028`; elevated intensity `0.07` for quote reveal states.

Glitch text:
- 3-layer effect with base text + `::before` + `::after`.
- Must use top/bottom band clipping and short stepped keyframes.
- `always=true` auto-fires on randomized intervals (3-7s).
- Trigger lockout while glitch is active (400ms default window).

## 4) Section Contracts

### Section 01: Hero
- Dark void background and desert particle depth scene.
- Animated hat SVG draw-on.
- Glitch title for HEISENBERG.
- Typewriter subtitle with randomized character delay.
- Counters revealed after typewriter completion.

### Section 02: Character Timeline
- Label row + horizontal progress track + season markers.
- 5 character cards with React-driven 3D tilt.
- Card click toggles selected character.
- Selection state panel with clear action.

### Section 03: Quotes Wall
- Header + result counter + tone filter pills.
- Character chip appears when a character is selected.
- Quotes grid with staggered reveal and hover lift.
- Clicking a quote opens full-screen reveal overlay.
- Quote card to reveal transition uses Framer Motion `layoutId` morph.

### Section 04: Chemistry Explorer
- 8 element tiles.
- Active tile drives molecule selection.
- Connection note panel shown when element active.
- Canvas molecule viewer supports auto-orbit and drag rotation.

## 5) TypeScript and Data Contracts

Global TS quality bar:
- Strict TypeScript.
- Zero explicit `any`.
- Use discriminated unions for async/data states.
- Prefer generics for reusable hooks and utilities.

Required domain types:
- `Quote.season` must be `1 | 2 | 3 | 4 | 5` (never plain number).
- `Quote.tone` must be union of: `menacing | humorous | reflective | vulnerable`.
- Strong typed chemistry atom/molecule structures.

Static data source files:
- `src/data/quotes.json`
- `src/data/characters.json`
- `src/data/elements.json`
- `src/data/molecules.json`

Loading pattern:
- Use dynamic import + `useTypedData`.
- Handle every branch: `idle`, `loading`, `success`, `error`.

## 6) State Management (Zustand)

Use only small focused stores:
- `useExplorerStore`
	- selected character
	- active quote
	- tone filter
- `useChemStore`
	- active element
	- active molecule
- `useUIStore`
	- active section index
	- grain intensity

Cross-section communication rules:
- No prop-drilling for app-level selection state.
- Use stores directly in sections/cards/overlays.

## 7) CSS Architecture Rules

Allowed:
- CSS Modules for component styles.
- Global style files for reset/tokens/animations.
- Inline styles only for runtime dynamic values (color, transform, animation delay).

Not allowed:
- No Tailwind.
- No CSS-in-JS.
- No component-level keyframe duplication when global keyframes exist.

Required global files:
- `src/styles/reset.css`
- `src/styles/tokens.css`
- `src/styles/animations.css`

Required CSS challenges:
- Fluid typography via `clamp()`.
- Container queries in card/grid wrappers.
- Scroll-driven timeline animation with CSS scroll timeline where supported.
- Staggered reveal patterns.
- Reusable shimmer skeleton class.
- Micro-interactions on all interactive controls.

## 8) Canvas and 3D Rules

Performance and lifecycle:
- Animation loop state in refs, not component state.
- Always cancel requestAnimationFrame on unmount.
- Cleanup timers/listeners/observers.

Desert scene:
- 3D particle coordinates projected into 2D with perspective formula.
- Particles drift and wrap.
- Depth controls opacity/size.

Molecule scene:
- Rotate and project atoms each frame.
- Depth sort before rendering spheres.
- Render bonds and atom glow.
- Auto-orbit by default, pause during drag, resume after delay.

## 9) Testing and TDD Standard

TDD is mandatory:
- Tests first.
- Confirm RED before implementation.
- Implement minimum to GREEN.
- Refactor while GREEN.

Coverage target:
- Minimum 80% lines/functions/branches.

Required testing stack:
- Vitest + Testing Library
- MSW for data loader and network-style tests
- vitest-canvas-mock for canvas component tests

Commit discipline expectation:
- test commit before corresponding feature commit.

## 10) Repository Structure Contract

Use this structure:

```text
src/
	components/
		canvas/
		ui/
		sections/
		cards/
		overlays/
	hooks/
	stores/
	utils/
	data/
	styles/
	types/
```

Do not introduce alternate architecture unless explicitly approved.

## 11) Master Agent Orchestration

This project uses specialized agents. Treat this section as master routing logic.

### Agent roles

- heisenberg-master
	- Orchestrates planner/testing/builders and enforces brief-level invariants across every task.

- heisenberg-planner
	- Produces one-feature implementation plans with TDD test cases and file paths.

- heisenberg-foundation
	- Implements utility functions and hooks only.

- heisenberg-data-state
	- Implements TypeScript domain types, JSON datasets, and Zustand stores.

- heisenberg-canvas-3d
	- Implements FilmGrain, Scanlines, desert canvas logic, molecule canvas logic.

- heisenberg-components
	- Implements React components, cards, overlays, and section assemblies.

- heisenberg-css
	- Implements tokens, animations, reset, and all CSS Modules/challenges.

- heisenberg-testing
	- Writes and validates tests first; ensures RED before feature code.

### Master workflow order

For any feature request, follow this order:
1. Plan with heisenberg-planner.
2. Write tests with heisenberg-testing.
3. Implement in the correct builder agent:
	 - foundation/data-state/canvas/components/css.
4. Re-run tests and lint.
5. Verify integration with stores and section behavior.

### Routing matrix

- If task mentions utility math/perf/color/formatter/chem or generic hooks:
	- route to heisenberg-foundation.

- If task mentions JSON datasets, type interfaces, or Zustand changes:
	- route to heisenberg-data-state.

- If task mentions requestAnimationFrame, canvas rendering, particles, molecule projection, drag-to-rotate:
	- route to heisenberg-canvas-3d.

- If task mentions React section/card/overlay/UI assembly:
	- route to heisenberg-components.

- If task mentions style tokens, keyframes, module styles, layout/motion polish, container queries:
	- route to heisenberg-css.

- If task is test-only, coverage, mocks, red-green loops:
	- route to heisenberg-testing.

## 12) Quality Gates (Definition of Done)

A feature is done only if all checks pass:
- Correct agent scope respected.
- Test-first workflow followed.
- TypeScript strict with zero `any`.
- Lint and tests pass.
- Scroll-snap and section reveal behavior preserved.
- Visual tokens and typography constraints preserved.
- Accessibility and keyboard interactions not regressed.

## 13) Delivery Style

When generating output:
- Be explicit about files touched.
- Explain assumptions briefly.
- Prefer small, reversible commits.
- Do not break established contracts in this file unless explicitly requested.

Say my name.
